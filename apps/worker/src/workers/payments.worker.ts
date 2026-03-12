import { Worker, Queue } from "bullmq";
import { prisma, OrderStatus, SubscriptionStatus } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import type { RedisConnection, PaymentsWebhookJobData } from "../types";

export function registerPaymentsWorker(connection: RedisConnection): void {
  const deliveryQueue = new Queue(QUEUES.DELIVERY_SCHEDULER, { connection });
  const whatsappOutboundQueue = new Queue(QUEUES.WHATSAPP_OUTBOUND, { connection });

  new Worker<PaymentsWebhookJobData>(
    QUEUES.PAYMENTS_WEBHOOKS,
    async (job) => {
      const { providerEventId, eventType, data, metadata } = job.data;

      try {
        const existingEvent = await prisma.paymentWebhookEvent.findUnique({
          where: {
            provider_providerEventId: {
              provider: "PAYSTACK",
              providerEventId,
            },
          },
        });

        if (existingEvent?.status === "PROCESSED") return;

        if (eventType === "charge.success") {
          await handleChargeSuccess(data, metadata, deliveryQueue);
        } else if (
          eventType === "charge.failed" ||
          eventType === "invoice.payment_failed" ||
          eventType === "subscription.disable"
        ) {
          await handleChargeFailed(metadata, whatsappOutboundQueue);
        } else if (eventType === "transfer.success") {
          await handleTransferSuccess(data, metadata);
        } else if (eventType === "transfer.failed" || eventType === "transfer.reversed") {
          await handleTransferFailed(data, metadata, whatsappOutboundQueue);
        }

        await prisma.paymentWebhookEvent.update({
          where: {
            provider_providerEventId: {
              provider: "PAYSTACK",
              providerEventId,
            },
          },
          data: { status: "PROCESSED", processedAt: new Date() },
        });
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`[PAYMENT] Error processing event ${providerEventId}`, {
          error: err.message,
          stack: err.stack,
          providerEventId,
          app: "worker",
        });

        await prisma.paymentWebhookEvent.update({
          where: {
            provider_providerEventId: {
              provider: "PAYSTACK",
              providerEventId,
            },
          },
          data: { status: "FAILED" },
        });

        throw error;
      }
    },
    { 
      connection,
      concurrency: 5,
      lockDuration: 30000,
      stalledInterval: 30000,
      maxStalledCount: 2,
    },
  );

  logger.info("Registered payments worker", { queue: QUEUES.PAYMENTS_WEBHOOKS, app: "worker" });
}

// ─── Handlers ──────────────────────────────────────────────────

async function handleChargeSuccess(
  data: PaymentsWebhookJobData["data"],
  metadata: PaymentsWebhookJobData["metadata"],
  deliveryQueue: Queue,
): Promise<void> {
  const storeId = metadata?.storeId;
  const purchaseType = metadata?.type;
  const billingCycle = metadata?.billingCycle as "monthly" | "quarterly" | undefined;

  if (!storeId) {
    logger.warn("[PAYMENT] No storeId in metadata", { app: "worker" });
    return;
  }

  if (purchaseType === "subscription") {
    // Calculate period dates based on billing cycle
    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === "quarterly") {
      periodEnd.setMonth(periodEnd.getMonth() + 3);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    await prisma.subscription.upsert({
      where: { storeId },
      update: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        providerSubscriptionId: data.reference,
        updatedAt: now,
      },
      create: {
        storeId,
        planKey: (metadata?.newPlan as string)?.toUpperCase() || "STARTER",
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        provider: "PAYSTACK",
        providerSubscriptionId: data.reference,
      },
    });

    // Also update the store's plan
    await prisma.store.update({
      where: { id: storeId },
      data: { plan: (metadata?.newPlan as string)?.toUpperCase() || "STARTER" },
    });

    logger.info("[PAYMENT] Subscription activated", { storeId, billingCycle, app: "worker" });
  } else if (purchaseType === "template_purchase") {
    const templateId = metadata?.templateId;
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (store && templateId) {
      const settings = (store.settings as { purchasedTemplates?: string[] }) || {};
      const purchased = settings.purchasedTemplates || [];
      if (!purchased.includes(templateId)) {
        purchased.push(templateId);
        await prisma.store.update({
          where: { id: storeId },
          data: { settings: { ...settings, purchasedTemplates: purchased } },
        });
      }
    }
  } else if (purchaseType === "storefront_order") {
    const orderId = metadata?.orderId;
    if (orderId) {
      const amountNet = data.amount / 100;
      const amountKobo = BigInt(data.amount);

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.PAID,
            paymentStatus: "SUCCESS",
          },
        }),
        prisma.paymentTransaction.create({
          data: {
            storeId,
            orderId,
            reference: data.reference,
            provider: "PAYSTACK",
            amount: amountNet,
            currency: data.currency || "NGN",
            status: "SUCCESS",
            type: "CHARGE",
          },
        }),
        prisma.wallet.upsert({
          where: { storeId },
          update: { availableKobo: { increment: amountKobo } },
          create: { storeId, availableKobo: amountKobo, kycStatus: "VERIFIED" },
        }),
        prisma.ledgerEntry.create({
          data: {
            storeId,
            referenceType: "ORDER",
            referenceId: orderId,
            direction: "CREDIT",
            account: "WALLET",
            amount: amountNet,
            currency: data.currency || "NGN",
            description: `Payment for Order #${orderId}`,
          },
        }),
      ]);

      await deliveryQueue.add("schedule", { orderId });
    }
  }
}

async function handleChargeFailed(
  metadata: PaymentsWebhookJobData["metadata"],
  whatsappOutboundQueue: Queue,
): Promise<void> {
  const storeId = metadata?.storeId;
  const purchaseType = metadata?.type;

  if (purchaseType !== "subscription" || !storeId) return;

  // Set grace period (5 days from now)
  const gracePeriodEndsAt = new Date();
  gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 5);

  await prisma.subscription.update({
    where: { storeId },
    data: { 
      status: SubscriptionStatus.GRACE_PERIOD,
      gracePeriodEndsAt,
    },
  });

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      memberships: {
        where: { role_enum: "OWNER" },
        include: { user: true },
      },
    },
  });

  const ownerPhone = store?.memberships?.[0]?.user?.phone;
  if (ownerPhone) {
    await whatsappOutboundQueue.add("send", {
      to: ownerPhone,
      body: `Your Vayva subscription payment failed. We've kept your store LIVE for now, but you have a 5-day grace period to update your card.\n\nFix it here: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      storeId,
    });
  }

  logger.warn("[PAYMENT] Subscription payment failed, grace period started", { 
    storeId, 
    gracePeriodEndsAt,
    app: "worker" 
  });
}

async function handleTransferSuccess(
  data: PaymentsWebhookJobData["data"],
  metadata: PaymentsWebhookJobData["metadata"],
): Promise<void> {
  const storeId = metadata?.storeId;
  const reference = data.reference;

  if (!storeId || !reference) {
    logger.warn("[PAYMENT] Missing storeId or reference in transfer success", { app: "worker" });
    return;
  }

  // Update withdrawal/transfer status
  const withdrawal = await prisma.walletWithdrawal.findFirst({
    where: { reference, storeId },
  });

  if (withdrawal) {
    await prisma.walletWithdrawal.update({
      where: { id: withdrawal.id },
      data: { status: "SUCCESS", processedAt: new Date() },
    });

    // Deduct from wallet (already done during initiation, but confirm)
    const amountKobo = BigInt(Math.round(withdrawal.amount * 100));
    await prisma.wallet.update({
      where: { storeId },
      data: { availableKobo: { decrement: amountKobo } },
    });

    logger.info("[PAYMENT] Transfer completed successfully", { storeId, reference, app: "worker" });
  }
}

async function handleTransferFailed(
  data: PaymentsWebhookJobData["data"],
  metadata: PaymentsWebhookJobData["metadata"],
  whatsappOutboundQueue: Queue,
): Promise<void> {
  const storeId = metadata?.storeId;
  const reference = data.reference;

  if (!storeId || !reference) {
    logger.warn("[PAYMENT] Missing storeId or reference in transfer failed", { app: "worker" });
    return;
  }

  // Update withdrawal status
  const withdrawal = await prisma.walletWithdrawal.findFirst({
    where: { reference, storeId },
  });

  if (withdrawal) {
    await prisma.walletWithdrawal.update({
      where: { id: withdrawal.id },
      data: { status: "FAILED", failureReason: data.reason || "Transfer failed" },
    });

    // Refund the wallet (return the amount since transfer failed)
    const amountKobo = BigInt(Math.round(withdrawal.amount * 100));
    await prisma.wallet.update({
      where: { storeId },
      data: { availableKobo: { increment: amountKobo } },
    });

    // Notify merchant
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        memberships: {
          where: { role_enum: "OWNER" },
          include: { user: true },
        },
      },
    });

    const ownerPhone = store?.memberships?.[0]?.user?.phone;
    if (ownerPhone) {
      await whatsappOutboundQueue.add("send", {
        to: ownerPhone,
        body: `Your Vayva wallet withdrawal of ₦${withdrawal.amount.toLocaleString()} failed. The money has been returned to your wallet.\n\nCheck your withdrawal settings: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/banking`,
        storeId,
      });
    }

    logger.error("[PAYMENT] Transfer failed, wallet refunded", { 
      storeId, 
      reference, 
      reason: data.reason,
      app: "worker" 
    });
  }
}
