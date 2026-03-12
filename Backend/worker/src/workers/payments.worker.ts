import { Worker, Queue } from "bullmq";
import { prisma, OrderStatus } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import type { RedisConnection, PaymentsWebhookJobData } from "../types";

export function registerPaymentsWorker(connection: RedisConnection): void {
  const deliveryQueue = new Queue(QUEUES.DELIVERY_SCHEDULER, { connection });
  const whatsappOutboundQueue = new Queue(QUEUES.WHATSAPP_OUTBOUND, {
    connection,
  });

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
    { connection },
  );

  logger.info("Registered payments worker", {
    queue: QUEUES.PAYMENTS_WEBHOOKS,
    app: "worker",
  });
}

// ─── Handlers ──────────────────────────────────────────────────

async function handleChargeSuccess(
  data: PaymentsWebhookJobData["data"],
  metadata: PaymentsWebhookJobData["metadata"],
  deliveryQueue: Queue,
): Promise<void> {
  const storeId = metadata?.storeId;
  const purchaseType = metadata?.type;

  if (!storeId) {
    logger.warn("[PAYMENT] No storeId in metadata", { app: "worker" });
    return;
  }

  if (purchaseType === "subscription") {
    await prisma.subscription.update({
      where: { storeId },
      data: { status: "ACTIVE" },
    });
  } else if (purchaseType === "template_purchase") {
    const templateId = metadata?.templateId;
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (store && templateId) {
      const settings =
        (store.settings as { purchasedTemplates?: string[] }) || {};
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

  await prisma.subscription.update({
    where: { storeId },
    data: { status: "GRACE_PERIOD" },
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
}
