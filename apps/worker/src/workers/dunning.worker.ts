/**
 * Dunning Worker - Failed Payment Recovery System
 * 
 * Manages subscription payment failures through automated retry sequences
 * and customer notifications to recover involuntary churn.
 * 
 * Schedule: Daily at 2:00 AM
 * 
 * Retry Sequence:
 * - Day 0: First failure → Immediate retry + email notification
 * - Day 2: Second failure → Retry + urgent email
 * - Day 5: Third failure → Final retry + final notice (phone SMS optional)
 * - Day 7: Give up → Restrict features, mark as churned, trigger win-back
 * 
 * @module DunningWorker
 */

import { prisma } from "@vayva/db";
import { logger } from "@vayva/logger";
import { withErrorTracking } from "../../lib/sentry";
import { sendEmail } from "@vayva/emails";
import type { Job } from "bullmq";

interface DunningJobData {
  storeId: string;
  subscriptionId: string;
  failureReason: string;
  amountDue: number;
  attemptNumber: number;
  lastAttemptDate: string;
}

interface FailedSubscription {
  id: string;
  storeId: string;
  store: {
    slug: string;
    plan: string;
    owner: {
      email: string;
      phone?: string | null;
      firstName?: string | null;
    };
  };
  status: string;
  failureCount: number;
  lastFailureDate: Date;
  nextRetryDate: Date;
  amountDue: number;
}

/**
 * Maximum retry attempts before giving up
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Days between retry attempts
 */
const RETRY_INTERVALS = [0, 2, 5]; // Day 0, Day 2, Day 5

/**
 * Days after which to restrict features
 */
const DAYS_BEFORE_RESTRICTION = 7;

/**
 * Main dunning worker function
 */
export async function processDunningQueue(job?: Job<DunningJobData>): Promise<void> {
  const workerStartTime = Date.now();
  let processedCount = 0;
  let successCount = 0;
  let failureCount = 0;

  logger.info("[DUNNING_WORKER_STARTED]", {
    startTime: new Date(workerStartTime).toISOString(),
    jobId: job?.id,
  });

  try {
    // If specific job data provided, process single subscription
    if (job?.data) {
      await handleSingleDunningCase(job.data);
      processedCount++;
      successCount++;
    } else {
      // Otherwise, fetch all subscriptions needing dunning action
      const failedSubscriptions = await fetchFailedSubscriptions();
      
      logger.info("[DUNNING_FETCHED]", {
        count: failedSubscriptions.length,
        maxAttempts: MAX_RETRY_ATTEMPTS,
      });

      // Process each failed subscription
      for (const subscription of failedSubscriptions) {
        try {
          await handleDunningForSubscription(subscription);
          successCount++;
        } catch (error) {
          logger.error("[DUNNING_SUBSCRIPTION_ERROR]", error, {
            subscriptionId: subscription.id,
            storeId: subscription.storeId,
          });
          failureCount++;
        }
        processedCount++;
      }
    }

    const duration = Date.now() - workerStartTime;
    logger.info("[DUNNING_WORKER_COMPLETED]", {
      duration: `${duration}ms`,
      processed: processedCount,
      successful: successCount,
      failed: failureCount,
    });

  } catch (error) {
    logger.error("[DUNNING_WORKER_ERROR]", error);
    throw error;
  }
}

/**
 * Fetch subscriptions that need dunning action
 */
async function fetchFailedSubscriptions(): Promise<FailedSubscription[]> {
  const now = new Date();
  
  // Find subscriptions with failed payments that need retry
  const subscriptions = await prisma.merchantAiSubscription.findMany({
    where: {
      status: {
        in: ["PAST_DUE", "PAYMENT_FAILED"],
      },
      nextRetryDate: {
        lte: now,
      },
      failureCount: {
        lt: MAX_RETRY_ATTEMPTS,
      },
    },
    include: {
      store: {
        select: {
          slug: true,
          plan: true,
          owner: {
            select: {
              email: true,
              phone: true,
              firstName: true,
            },
          },
        },
      },
    },
    orderBy: {
      lastFailureDate: "asc", // Oldest failures first
    },
  });

  return subscriptions as unknown as FailedSubscription[];
}

/**
 * Handle dunning process for a single subscription
 */
async function handleDunningForSubscription(
  subscription: FailedSubscription
): Promise<void> {
  const { store, failureCount, amountDue, id: subscriptionId } = subscription;
  const storeId = subscription.storeId;

  logger.info("[DUNNING_PROCESSING]", {
    storeId,
    subscriptionId,
    failureCount,
    amountDue,
    plan: store.plan,
  });

  // Determine current attempt number
  const attemptNumber = failureCount + 1;

  // Get retry interval for this attempt
  const retryInterval = RETRY_INTERVALS[attemptNumber - 1] || RETRY_INTERVALS[RETRY_INTERVALS.length - 1];

  // Calculate next retry date
  const nextRetryDate = new Date();
  nextRetryDate.setDate(nextRetryDate.getDate() + retryInterval);

  // Send appropriate email based on attempt number
  await sendDunningEmail({
    email: store.owner.email,
    firstName: store.owner.firstName || "Valued Customer",
    storeName: store.slug,
    plan: store.plan,
    amountDue,
    attemptNumber,
    maxAttempts: MAX_RETRY_ATTEMPTS,
    nextRetryDate,
  });

  // Update subscription with next retry date
  await prisma.merchantAiSubscription.update({
    where: { id: subscriptionId },
    data: {
      nextRetryDate,
      failureCount: attemptNumber,
      lastDunningEmailSentAt: new Date(),
    },
  });

  // Log dunning action
  await prisma.subscriptionEvent.create({
    data: {
      subscriptionId,
      eventType: "DUNNING_EMAIL_SENT",
      metadata: {
        attemptNumber,
        amountDue,
        nextRetryDate: nextRetryDate.toISOString(),
      },
    },
  });

  // If this was the final attempt, restrict features
  if (attemptNumber >= MAX_RETRY_ATTEMPTS) {
    await restrictSubscriptionFeatures(storeId, subscriptionId);
  }

  logger.info("[DUNNING_COMPLETED]", {
    storeId,
    subscriptionId,
    attemptNumber,
    nextRetryDate: nextRetryDate.toISOString(),
  });
}

/**
 * Handle a specific dunning case (from direct job)
 */
async function handleSingleDunningCase(data: DunningJobData): Promise<void> {
  const { storeId, subscriptionId, failureReason, amountDue, attemptNumber } = data;

  logger.info("[DUNNING_SINGLE_CASE]", {
    storeId,
    subscriptionId,
    failureReason,
    amountDue,
    attemptNumber,
  });

  // Fetch subscription details
  const subscription = await prisma.merchantAiSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      store: {
        select: {
          slug: true,
          plan: true,
          owner: {
            select: {
              email: true,
              firstName: true,
            },
          },
        },
      },
    },
  });

  if (!subscription) {
    throw new Error(`Subscription ${subscriptionId} not found`);
  }

  // Send email
  await sendDunningEmail({
    email: subscription.store.owner.email,
    firstName: subscription.store.owner.firstName || "Valued Customer",
    storeName: subscription.store.slug,
    plan: subscription.store.plan,
    amountDue,
    attemptNumber,
    maxAttempts: MAX_RETRY_ATTEMPTS,
    nextRetryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
  });

  // Update subscription
  await prisma.merchantAiSubscription.update({
    where: { id: subscriptionId },
    data: {
      failureCount: attemptNumber,
      lastDunningEmailSentAt: new Date(),
      failureReason,
    },
  });

  // Log event
  await prisma.subscriptionEvent.create({
    data: {
      subscriptionId,
      eventType: "DUNNING_EMAIL_SENT",
      metadata: {
        attemptNumber,
        amountDue,
        failureReason,
      },
    },
  });

  // If final attempt, restrict features
  if (attemptNumber >= MAX_RETRY_ATTEMPTS) {
    await restrictSubscriptionFeatures(storeId, subscriptionId);
  }
}

/**
 * Send dunning email based on attempt number
 */
async function sendDunningEmail(params: {
  email: string;
  firstName: string;
  storeName: string;
  plan: string;
  amountDue: number;
  attemptNumber: number;
  maxAttempts: number;
  nextRetryDate: Date;
}): Promise<void> {
  const {
    email,
    firstName,
    storeName,
    plan,
    amountDue,
    attemptNumber,
    maxAttempts,
    nextRetryDate,
  } = params;

  let subject: string;
  let templateName: string;
  let urgency: "normal" | "urgent" | "critical";

  // Determine email template based on attempt
  if (attemptNumber === 1) {
    subject = `Payment Failed - Action Required for ${storeName}`;
    templateName = "dunning-first-attempt";
    urgency = "normal";
  } else if (attemptNumber === 2) {
    subject = `URGENT: Payment Still Failing - ${storeName} Subscription at Risk`;
    templateName = "dunning-second-attempt";
    urgency = "urgent";
  } else {
    subject = `FINAL NOTICE: Subscription Suspension Imminent - ${storeName}`;
    templateName = "dunning-final-notice";
    urgency = "critical";
  }

  // Send email
  await sendEmail({
    to: email,
    subject,
    template: templateName,
    data: {
      firstName,
      storeName,
      plan,
      amountDue: formatCurrency(amountDue),
      attemptNumber,
      maxAttempts,
      nextRetryDate: nextRetryDate.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      urgency,
      supportEmail: "support@vayva.tech",
      supportPhone: "07015459557",
    },
  });

  logger.info("[DUNNING_EMAIL_SENT]", {
    email,
    template: templateName,
    attemptNumber,
  });
}

/**
 * Restrict subscription features after final failed attempt
 */
async function restrictSubscriptionFeatures(
  storeId: string,
  subscriptionId: string
): Promise<void> {
  logger.info("[RESTRICTING_FEATURES]", {
    storeId,
    subscriptionId,
  });

  // Update store plan to FREE (restricted)
  await prisma.store.update({
    where: { id: storeId },
    data: {
      plan: "FREE",
      restrictedAt: new Date(),
      restrictionReason: "PAYMENT_FAILED_MAX_ATTEMPTS",
    },
  });

  // Update subscription status
  await prisma.merchantAiSubscription.update({
    where: { id: subscriptionId },
    data: {
      status: "CANCELLED",
      cancellationReason: "PAYMENT_FAILED",
      cancelledAt: new Date(),
    },
  });

  // Log restriction event
  await prisma.subscriptionEvent.create({
    data: {
      subscriptionId,
      eventType: "SUBSCRIPTION_RESTRICTED",
      metadata: {
        reason: "PAYMENT_FAILED_MAX_ATTEMPTS",
        previousPlan: "PAID",
        newPlan: "FREE",
      },
    },
  });

  // Send restriction notification
  const subscription = await prisma.merchantAiSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      store: {
        select: {
          owner: {
            select: {
              email: true,
              firstName: true,
            },
          },
        },
      },
    },
  });

  if (subscription) {
    await sendEmail({
      to: subscription.store.owner.email,
      subject: "Subscription Suspended - Payment Failed",
      template: "subscription-suspended",
      data: {
        firstName: subscription.store.owner.firstName || "Valued Customer",
        storeName: subscription.store.slug,
        restrictionDate: new Date().toLocaleDateString("en-NG"),
        reactivationUrl: `https://merchant.vayva.tech/dashboard/billing?reactivate=1`,
        supportEmail: "support@vayva.tech",
      },
    });
  }

  logger.info("[FEATURES_RESTRICTED]", {
    storeId,
    subscriptionId,
  });
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Export for worker registration
 */
export const dunningWorker = {
  name: "dunning-worker",
  processor: processDunningQueue,
  schedule: "0 2 * * *", // Daily at 2:00 AM
};
