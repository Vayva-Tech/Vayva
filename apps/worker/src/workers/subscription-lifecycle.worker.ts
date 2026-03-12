import { Worker, Queue } from "bullmq";
import { prisma, SubscriptionStatus, AiSubscriptionStatus } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import type { RedisConnection } from "../types";

/**
 * Subscription Lifecycle Worker
 *
 * Handles automated subscription state transitions:
 * - Trial expiration and grace period management
 * - Subscription renewal attempts
 * - Grace period enforcement (suspension)
 * - Monthly usage counter resets
 *
 * Runs daily at 2 AM via BullMQ cron schedule.
 */

export function registerSubscriptionLifecycleWorker(connection: RedisConnection): void {
  const whatsappOutboundQueue = new Queue(QUEUES.WHATSAPP_OUTBOUND, { connection });

  new Worker(
    QUEUES.SUBSCRIPTION_LIFECYCLE,
    async (job) => {
      const { type } = job.data;

      logger.info("[SUBSCRIPTION_LIFECYCLE] Starting daily processing", {
        type,
        app: "worker",
      });

      try {
        switch (type) {
          case "daily-check":
            await processTrialExpirations(whatsappOutboundQueue);
            await processTrialGraceExpirations(whatsappOutboundQueue);
            await processSubscriptionRenewals(whatsappOutboundQueue);
            await processSubscriptionGraceExpirations(whatsappOutboundQueue);
            await resetMonthlyUsageCounters();
            break;
          default:
            logger.warn("[SUBSCRIPTION_LIFECYCLE] Unknown job type", { type, app: "worker" });
        }

        logger.info("[SUBSCRIPTION_LIFECYCLE] Daily processing completed", { app: "worker" });
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[SUBSCRIPTION_LIFECYCLE] Processing failed", {
          error: err.message,
          stack: err.stack,
          app: "worker",
        });
        throw error;
      }
    },
    {
      connection,
      concurrency: 1,
      lockDuration: 300000, // 5 minutes
    },
  );

  logger.info("Registered subscription lifecycle worker", {
    queue: QUEUES.SUBSCRIPTION_LIFECYCLE,
    app: "worker",
  });
}

/**
 * Schedule the daily subscription lifecycle check
 */
export async function scheduleSubscriptionLifecycleJobs(queue: Queue): Promise<void> {
  // Daily at 2:00 AM
  await queue.add(
    "daily-check",
    { type: "daily-check" },
    {
      repeat: { pattern: "0 2 * * *" },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  logger.info("Scheduled subscription lifecycle daily check", { app: "worker" });
}

// ─── Trial Expiration Processing ────────────────────────────────────────────

async function processTrialExpirations(whatsappQueue: Queue): Promise<void> {
  const now = new Date();

  // Find AI subscriptions where trial expired > 24 hours ago and still in TRIAL_ACTIVE
  const expiredTrials = await prisma.merchantAiSubscription.findMany({
    where: {
      status: AiSubscriptionStatus.TRIAL_ACTIVE,
      trialExpiresAt: {
        lt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Expired more than 24h ago
      },
    },
    include: {
      store: {
        include: {
          memberships: {
            where: { role_enum: "OWNER" },
            include: { user: true },
          },
        },
      },
    },
  });

  logger.info(`[SUBSCRIPTION_LIFECYCLE] Found ${expiredTrials.length} expired trials to process`, {
    app: "worker",
  });

  for (const subscription of expiredTrials) {
    try {
      // Move to TRIAL_EXPIRED_GRACE with 3-day grace period
      const graceEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      await prisma.merchantAiSubscription.update({
        where: { id: subscription.id },
        data: {
          status: AiSubscriptionStatus.TRIAL_EXPIRED_GRACE,
          graceEndsAt,
          updatedAt: now,
        },
      });

      // Send WhatsApp notification to owner
      const ownerPhone = subscription.store.memberships?.[0]?.user?.phone;
      if (ownerPhone) {
        await whatsappQueue.add("send", {
          to: ownerPhone,
          body: `Your Vayva AI trial has expired. You have 3 days to upgrade before your AI features are suspended.\n\nUpgrade now: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
          storeId: subscription.storeId,
        });
      }

      logger.info(`[SUBSCRIPTION_LIFECYCLE] Trial expired for store ${subscription.storeId}`, {
        storeId: subscription.storeId,
        graceEndsAt,
        app: "worker",
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `[SUBSCRIPTION_LIFECYCLE] Failed to process trial expiration for ${subscription.storeId}`,
        {
          error: err.message,
          storeId: subscription.storeId,
          app: "worker",
        },
      );
      // Continue processing other subscriptions
    }
  }
}

// ─── Trial Grace Period Expiration ─────────────────────────────────────────

async function processTrialGraceExpirations(whatsappQueue: Queue): Promise<void> {
  const now = new Date();

  // Find AI subscriptions in TRIAL_EXPIRED_GRACE where grace period has ended
  const expiredGrace = await prisma.merchantAiSubscription.findMany({
    where: {
      status: AiSubscriptionStatus.TRIAL_EXPIRED_GRACE,
      graceEndsAt: {
        lt: now,
      },
    },
    include: {
      store: {
        include: {
          memberships: {
            where: { role_enum: "OWNER" },
            include: { user: true },
          },
        },
      },
    },
  });

  logger.info(
    `[SUBSCRIPTION_LIFECYCLE] Found ${expiredGrace.length} expired trial grace periods`,
    {
      app: "worker",
    },
  );

  for (const subscription of expiredGrace) {
    try {
      // Move to SOFT_CLOSED - AI features disabled
      await prisma.merchantAiSubscription.update({
        where: { id: subscription.id },
        data: {
          status: AiSubscriptionStatus.SOFT_CLOSED,
          closedAt: now,
          updatedAt: now,
        },
      });

      // Send final notice
      const ownerPhone = subscription.store.memberships?.[0]?.user?.phone;
      if (ownerPhone) {
        await whatsappQueue.add("send", {
          to: ownerPhone,
          body: `Your Vayva AI features have been suspended due to trial expiration. Upgrade anytime to reactivate.\n\nUpgrade: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
          storeId: subscription.storeId,
        });
      }

      logger.info(
        `[SUBSCRIPTION_LIFECYCLE] Trial grace expired, AI suspended for store ${subscription.storeId}`,
        {
          storeId: subscription.storeId,
          app: "worker",
        },
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `[SUBSCRIPTION_LIFECYCLE] Failed to process grace expiration for ${subscription.storeId}`,
        {
          error: err.message,
          storeId: subscription.storeId,
          app: "worker",
        },
      );
    }
  }
}

// ─── Subscription Renewal Processing ───────────────────────────────────────

async function processSubscriptionRenewals(whatsappQueue: Queue): Promise<void> {
  const now = new Date();

  // Find subscriptions where period has ended and not set to cancel
  const dueForRenewal = await prisma.subscription.findMany({
    where: {
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE] },
      currentPeriodEnd: {
        lt: now,
      },
      cancelAtPeriodEnd: false,
    },
    include: {
      store: {
        include: {
          memberships: {
            where: { role_enum: "OWNER" },
            include: { user: true },
          },
        },
      },
    },
  });

  logger.info(
    `[SUBSCRIPTION_LIFECYCLE] Found ${dueForRenewal.length} subscriptions due for renewal`,
    {
      app: "worker",
    },
  );

  for (const subscription of dueForRenewal) {
    try {
      // For now, we attempt renewal by entering grace period
      // In the future, this should initiate a Paystack charge
      const gracePeriodEndsAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.GRACE_PERIOD,
          gracePeriodEndsAt,
          updatedAt: now,
        },
      });

      // Reset monthly usage counters on renewal attempt
      await resetStoreMonthlyUsage(subscription.storeId);

      // Notify owner
      const ownerPhone = subscription.store.memberships?.[0]?.user?.phone;
      if (ownerPhone) {
        await whatsappQueue.add("send", {
          to: ownerPhone,
          body: `Your Vayva subscription renewal failed. We've extended your service for 5 days. Please update your payment method.\n\nBilling: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
          storeId: subscription.storeId,
        });
      }

      logger.info(
        `[SUBSCRIPTION_LIFECYCLE] Subscription renewal attempted for store ${subscription.storeId}`,
        {
          storeId: subscription.storeId,
          gracePeriodEndsAt,
          app: "worker",
        },
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `[SUBSCRIPTION_LIFECYCLE] Failed to process renewal for ${subscription.storeId}`,
        {
          error: err.message,
          storeId: subscription.storeId,
          app: "worker",
        },
      );
    }
  }
}

// ─── Subscription Grace Period Enforcement ─────────────────────────────────

async function processSubscriptionGraceExpirations(whatsappQueue: Queue): Promise<void> {
  const now = new Date();

  // Find subscriptions in GRACE_PERIOD where grace has expired
  const expiredGrace = await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.GRACE_PERIOD,
      gracePeriodEndsAt: {
        lt: now,
      },
    },
    include: {
      store: {
        include: {
          memberships: {
            where: { role_enum: "OWNER" },
            include: { user: true },
          },
        },
      },
    },
  });

  logger.info(
    `[SUBSCRIPTION_LIFECYCLE] Found ${expiredGrace.length} subscriptions with expired grace period`,
    {
      app: "worker",
    },
  );

  for (const subscription of expiredGrace) {
    try {
      // Suspend the store
      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.PAST_DUE,
            updatedAt: now,
          },
        }),
        prisma.store.update({
          where: { id: subscription.storeId },
          data: {
            isActive: false,
            updatedAt: now,
          },
        }),
      ]);

      // Notify owner
      const ownerPhone = subscription.store.memberships?.[0]?.user?.phone;
      if (ownerPhone) {
        await whatsappQueue.add("send", {
          to: ownerPhone,
          body: `Your Vayva store has been suspended due to non-payment. Reactivate anytime by updating your billing information.\n\nReactivate: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
          storeId: subscription.storeId,
        });
      }

      logger.warn(
        `[SUBSCRIPTION_LIFECYCLE] Store suspended due to expired grace period: ${subscription.storeId}`,
        {
          storeId: subscription.storeId,
          app: "worker",
        },
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `[SUBSCRIPTION_LIFECYCLE] Failed to suspend store ${subscription.storeId}`,
        {
          error: err.message,
          storeId: subscription.storeId,
          app: "worker",
        },
      );
    }
  }
}

// ─── Monthly Usage Counter Reset ───────────────────────────────────────────

async function resetMonthlyUsageCounters(): Promise<void> {
  const now = new Date();

  // Find all active AI subscriptions where period has rolled over
  const subscriptionsNeedingReset = await prisma.merchantAiSubscription.findMany({
    where: {
      status: {
        in: [AiSubscriptionStatus.UPGRADED_ACTIVE, AiSubscriptionStatus.TRIAL_ACTIVE],
      },
      periodEnd: {
        lt: now,
      },
    },
  });

  logger.info(
    `[SUBSCRIPTION_LIFECYCLE] Resetting monthly usage for ${subscriptionsNeedingReset.length} subscriptions`,
    {
      app: "worker",
    },
  );

  for (const subscription of subscriptionsNeedingReset) {
    try {
      // Calculate new period
      const newPeriodStart = subscription.periodEnd;
      const newPeriodEnd = new Date(newPeriodStart);
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

      await prisma.merchantAiSubscription.update({
        where: { id: subscription.id },
        data: {
          monthTokensUsed: 0,
          monthImagesUsed: 0,
          monthRequestsUsed: 0,
          monthMessagesUsed: 0,
          periodStart: newPeriodStart,
          periodEnd: newPeriodEnd,
          updatedAt: now,
        },
      });

      logger.info(
        `[SUBSCRIPTION_LIFECYCLE] Reset monthly usage for subscription ${subscription.id}`,
        {
          subscriptionId: subscription.id,
          storeId: subscription.storeId,
          newPeriodEnd,
          app: "worker",
        },
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `[SUBSCRIPTION_LIFECYCLE] Failed to reset usage for subscription ${subscription.id}`,
        {
          error: err.message,
          subscriptionId: subscription.id,
          app: "worker",
        },
      );
    }
  }
}

/**
 * Reset monthly usage for a specific store (called on subscription renewal)
 */
async function resetStoreMonthlyUsage(storeId: string): Promise<void> {
  const now = new Date();

  await prisma.merchantAiSubscription.updateMany({
    where: { storeId },
    data: {
      monthTokensUsed: 0,
      monthImagesUsed: 0,
      monthRequestsUsed: 0,
      monthMessagesUsed: 0,
      updatedAt: now,
    },
  });

  logger.info(`[SUBSCRIPTION_LIFECYCLE] Reset monthly usage for store ${storeId}`, {
    storeId,
    app: "worker",
  });
}
