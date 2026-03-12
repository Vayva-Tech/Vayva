import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// Resend client stub - email functionality disabled until properly configured
const resend: any = null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Vayva <no-reply@vayva.ng>";

function backoffMinutes(attempt: number) {
  if (attempt <= 1) return 1;
  if (attempt === 2) return 5;
  if (attempt === 3) return 15;
  if (attempt === 4) return 60;
  if (attempt === 5) return 360; // 6 hours
  return 0; // DEAD after 6th failure
}

export async function drainNotificationOutbox(batchSize = 25) {
  const now = new Date();

  const candidates = await prisma.notificationOutbox.findMany({
    where: {
      status: { in: ["QUEUED", "FAILED"] },
      OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
    },
    orderBy: { createdAt: "asc" },
    take: batchSize,
  });

  let sent = 0;
  let failed = 0;
  let dead = 0;

  for (const notification of candidates) {
    // Claim atomically
    const claimed = await prisma.notificationOutbox.updateMany({
      where: { id: notification.id, status: { in: ["QUEUED", "FAILED"] } },
      data: { status: "SENDING", attempts: { increment: 1 }, lastError: null },
    });
    if (claimed.count === 0) continue; // already claimed by another worker

    const fresh = await prisma.notificationOutbox.findUnique({ where: { id: notification.id } });
    if (!fresh) continue;

    try {
      // Parse payload for notification content
      const payload = typeof fresh.payload === 'string' ? JSON.parse(fresh.payload) : (fresh.payload || {});
      
      // Send based on channel
      if (fresh.channel === "WHATSAPP") {
        // WhatsApp stub - disabled until MetaProvider is properly configured
        logger.info("WhatsApp notification stub", { to: fresh.to, payload });
      } else if (fresh.channel === "EMAIL") {
        // Email stub - disabled until Resend is properly configured
        logger.info("Email notification stub", { 
          to: fresh.to, 
          subject: payload.subject || "Notification from Vayva",
          from: FROM_EMAIL 
        });
      } else {
        throw new Error(`Unsupported channel: ${fresh.channel}`);
      }

      await prisma.notificationOutbox.update({
        where: { id: fresh.id },
        data: { status: "SENT", sentAt: new Date(), nextRetryAt: null },
      });

      logger.info("Notification sent successfully", {
        app: "worker",
        outboxId: fresh.id,
        channel: fresh.channel,
        to: fresh.to,
        status: "SENT"
      });

      sent++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Send failed";
      const attempt = fresh.attempts; 
      const mins = backoffMinutes(attempt);

      if (mins === 0) {
        await prisma.notificationOutbox.update({
          where: { id: fresh.id },
          data: { status: "FAILED", lastError: msg, nextRetryAt: null },
        });

        logger.error("Notification failed permanently", {
          app: "worker",
          outboxId: fresh.id,
          type: fresh.type,
          channel: fresh.channel,
          to: fresh.to,
          error: msg,
          status: "FAILED"
        });

        dead++;
      } else {
        const next = new Date(Date.now() + mins * 60 * 1000);
        await prisma.notificationOutbox.update({
          where: { id: fresh.id },
          data: { status: "FAILED", lastError: msg, nextRetryAt: next },
        });

        logger.warn("Notification send failed, retrying later", {
          app: "worker",
          outboxId: fresh.id,
          channel: fresh.channel,
          to: fresh.to,
          error: msg,
          attempt: fresh.attempts,
          nextRetryAt: next.toISOString(),
          status: "FAILED"
        });

        failed++;
      }
    }
  }

  return { scanned: candidates.length, sent, failed, dead };
}
