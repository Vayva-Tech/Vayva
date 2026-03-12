import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import {
  sendMerchantInvite,
  sendPasswordReset,
  sendOrderConfirmed,
  sendPaymentReceived,
  sendWelcome,
  sendShippingUpdate,
  sendOrderCancelled,
  sendRefundProcessed,
  sendSubscriptionActivated,
  sendTrialExpiring,
  sendLowStockAlert,
  sendKycStatus,
  sendDisputeOpened,
  sendRefundRequested,
} from "@vayva/emails/send";

function backoffMinutes(attempt: number) {
  if (attempt <= 1) return 1;
  if (attempt === 2) return 5;
  if (attempt === 3) return 15;
  if (attempt === 4) return 60;
  if (attempt === 5) return 360; // 6 hours
  return 0; // DEAD after 6th failure
}

export async function drainEmailOutbox(batchSize = 25) {
  const now = new Date();

  const candidates = await prisma.emailOutbox.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] as const },
      OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
    },
    orderBy: { createdAt: "asc" },
    take: batchSize,
  });

  let sent = 0;
  let failed = 0;
  let dead = 0;

  for (const email of candidates) {
    // Claim atomically
    const claimed = await prisma.emailOutbox.updateMany({
      where: { id: email.id, status: { in: ["PENDING", "FAILED"] as const } },
      data: { status: "SENDING", attempts: { increment: 1 }, lastError: null },
    });
    if (claimed.count === 0) continue; // already claimed by another worker

    const fresh = await prisma.emailOutbox.findUnique({
      where: { id: email.id },
    });
    if (!fresh) continue;

    try {
      const payload = (fresh.payload as Record<string, unknown>) || {};

      const senderMap: Record<
        string,
        (to: string, p: Record<string, unknown>) => Promise<unknown>
      > = {
        INVITE: (to, p) =>
          sendMerchantInvite(to, p as Parameters<typeof sendMerchantInvite>[1]),
        PASSWORD_RESET: (to, p) =>
          sendPasswordReset(to, p as Parameters<typeof sendPasswordReset>[1]),
        ORDER_CONFIRMED: (to, p) =>
          sendOrderConfirmed(to, p as Parameters<typeof sendOrderConfirmed>[1]),
        PAYMENT_RECEIVED: (to, p) =>
          sendPaymentReceived(
            to,
            p as Parameters<typeof sendPaymentReceived>[1],
          ),
        WELCOME: (to, p) =>
          sendWelcome(to, p as Parameters<typeof sendWelcome>[1]),
        SHIPPING_UPDATE: (to, p) =>
          sendShippingUpdate(to, p as Parameters<typeof sendShippingUpdate>[1]),
        ORDER_CANCELLED: (to, p) =>
          sendOrderCancelled(to, p as Parameters<typeof sendOrderCancelled>[1]),
        REFUND_PROCESSED: (to, p) =>
          sendRefundProcessed(
            to,
            p as Parameters<typeof sendRefundProcessed>[1],
          ),
        SUBSCRIPTION_ACTIVATED: (to, p) =>
          sendSubscriptionActivated(
            to,
            p as Parameters<typeof sendSubscriptionActivated>[1],
          ),
        TRIAL_EXPIRING: (to, p) =>
          sendTrialExpiring(to, p as Parameters<typeof sendTrialExpiring>[1]),
        LOW_STOCK_ALERT: (to, p) =>
          sendLowStockAlert(to, p as Parameters<typeof sendLowStockAlert>[1]),
        KYC_STATUS: (to, p) =>
          sendKycStatus(to, p as Parameters<typeof sendKycStatus>[1]),
        DISPUTE_OPENED: (to, p) =>
          sendDisputeOpened(to, p as Parameters<typeof sendDisputeOpened>[1]),
        REFUND_REQUESTED: (to, p) =>
          sendRefundRequested(
            to,
            p as Parameters<typeof sendRefundRequested>[1],
          ),
        DISPUTE_EVIDENCE_SUBMITTED: (to, p) =>
          sendDisputeOpened(to, p as Parameters<typeof sendDisputeOpened>[1]),
      };

      const sender = senderMap[fresh.type];
      if (!sender) {
        logger.warn(`Skipping unknown email type: ${fresh.type}`, {
          outboxId: fresh.id,
          type: fresh.type,
          app: "worker",
        });
        await prisma.emailOutbox.update({
          where: { id: fresh.id },
          data: {
            status: "DEAD",
            lastError: `Unknown email type: ${fresh.type}`,
          },
        });
        dead++;
        continue;
      }

      const res = await sender(fresh.toEmail, payload);
      const providerMessageId = (res as { data?: { id?: string } })?.data?.id;

      await prisma.emailOutbox.update({
        where: { id: fresh.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          nextRetryAt: null,
          providerMessageId,
        },
      });

      // 45.6: Log successful send
      logger.info("Email sent successfully", {
        app: "worker",
        outboxId: fresh.id,
        type: fresh.type,
        to: fresh.toEmail,
        providerMessageId,
        status: "SENT",
      });

      sent++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Send failed";
      const attempt = fresh.attempts; // already incremented on claim
      const mins = backoffMinutes(attempt);

      if (mins === 0) {
        await prisma.emailOutbox.update({
          where: { id: fresh.id },
          data: { status: "DEAD", lastError: msg, nextRetryAt: null },
        });

        // 45.6: Log dead email
        logger.error("Email failed permanently", {
          app: "worker",
          outboxId: fresh.id,
          type: fresh.type,
          to: fresh.toEmail,
          error: msg,
          status: "DEAD",
        });

        dead++;
      } else {
        const next = new Date(Date.now() + mins * 60 * 1000);
        await prisma.emailOutbox.update({
          where: { id: fresh.id },
          data: { status: "FAILED", lastError: msg, nextRetryAt: next },
        });

        // 45.6: Log failed attempt
        logger.warn("Email send failed, retrying later", {
          app: "worker",
          outboxId: fresh.id,
          type: fresh.type,
          to: fresh.toEmail,
          error: msg,
          attempt: fresh.attempts,
          nextRetryAt: next.toISOString(),
          status: "FAILED",
        });

        failed++;
      }
    }
  }

  return { scanned: candidates.length, sent, failed, dead };
}
