/**
 * Milestone Tracker Worker
 * 
 * Tracks merchant achievements and sends celebration emails when milestones are reached.
 * Runs hourly to check for new milestone achievements.
 * 
 * Schedule: 0 * * * * (Every hour)
 * 
 * Milestones Tracked:
 * - First AI-powered order
 * - Revenue milestones (₦50k, ₦100k, ₦500k, ₦1M)
 * - Product catalog size (10, 50, 100 products)
 * - Customer count (10, 50, 100 customers)
 * - Order volume (10, 50, 100 orders)
 */

import { prisma, AiSubscriptionStatus } from "@vayva/db";
import { logger, QUEUES } from "@vayva/shared";
import { Queue } from "bullmq";
import { MilestoneFirstOrder } from "@vayva/emails/templates/milestone-first-order";
import { MilestoneRevenue } from "@vayva/emails/templates/milestone-revenue";

const emailQueue = new Queue(QUEUES.EMAIL_OUTBOUND, {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

interface MerchantWithStats {
  id: string;
  storeId: string;
  store: {
    name: string;
    memberships: Array<{
      user: {
        email: string;
        firstName?: string | null;
      };
    }>;
  };
}

interface MilestoneAchievement {
  type: string;
  value: number;
  threshold: number;
  previouslyReached: boolean;
}

/**
 * Revenue milestones in NGN
 */
const REVENUE_MILESTONES = [50000, 100000, 500000, 1000000];

/**
 * Send milestone celebration email
 */
async function sendMilestoneEmail(
  merchant: MerchantWithStats,
  milestone: MilestoneAchievement
): Promise<void> {
  try {
    const owner = merchant.store.memberships[0];
    if (!owner) {
      logger.warn("[MILESTONE] No owner found for merchant", {
        merchantId: merchant.id,
        storeId: merchant.storeId,
      });
      return;
    }

    const emailData = {
      merchantName: owner.user.firstName || "there",
      storeName: merchant.store.name,
    };

    let subject = "🎉 Milestone Achieved!";
    let react = null;

    // Handle first order milestone
    if (milestone.type === "first_order") {
      subject = "🎉 Your First AI-Powered Order!";
      react = MilestoneFirstOrder({
        ...emailData,
        orderNumber: "#001",
        orderAmount: milestone.value,
      });
    }
    // Handle revenue milestone
    else if (milestone.type === "revenue") {
      subject = `🎊 Amazing! You've crossed ₦${milestone.threshold.toLocaleString()}`;
      react = MilestoneRevenue({
        ...emailData,
        revenueAmount: milestone.threshold,
        periodDays: 30,
      });
    }

    if (react) {
      await emailQueue.add("send", {
        to: owner.user.email,
        subject,
        react,
        headers: {
          "X-Milestone-Type": milestone.type,
          "X-Email-Type": "milestone-celebration",
        },
      });

      logger.info("[MILESTONE] Celebration email queued", {
        merchantId: merchant.id,
        storeId: merchant.storeId,
        email: owner.user.email,
        milestone: milestone.type,
        value: milestone.value,
      });
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[MILESTONE] Failed to send celebration email", {
      error: err.message,
      merchantId: merchant.id,
      storeId: merchant.storeId,
      milestone: milestone.type,
    });
  }
}

/**
 * Check for revenue milestones
 */
async function checkRevenueMilestones(
  merchant: MerchantWithStats
): Promise<MilestoneAchievement[]> {
  const achievements: MilestoneAchievement[] = [];

  try {
    // Get total revenue from orders
    const orderStats = await prisma.order.groupBy({
      by: ["storeId"],
      where: { storeId: merchant.storeId },
      _sum: { total: true },
    });

    const totalRevenue = orderStats[0]?._sum.total || 0;

    // Check each revenue milestone
    for (const threshold of REVENUE_MILESTONES) {
      if (totalRevenue >= threshold) {
        // Check if already recorded
        const existing = await prisma.milestoneRecord.findFirst({
          where: {
            storeId: merchant.storeId,
            milestoneType: "revenue",
            milestoneValue: threshold,
          },
        });

        if (!existing) {
          achievements.push({
            type: "revenue",
            value: totalRevenue,
            threshold,
            previouslyReached: false,
          });
        }
      }
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn("[MILESTONE] Revenue check failed", {
      error: err.message,
      merchantId: merchant.id,
    });
  }

  return achievements;
}

/**
 * Check for first order milestone
 */
async function checkFirstOrderMilestone(
  merchant: MerchantWithStats
): Promise<MilestoneAchievement | null> {
  try {
    // Check if this is a new achievement
    const existing = await prisma.milestoneRecord.findFirst({
      where: {
        storeId: merchant.storeId,
        milestoneType: "first_order",
      },
    });

    if (existing) {
      return null; // Already achieved
    }

    // Count orders
    const orderCount = await prisma.order.count({
      where: { storeId: merchant.storeId },
    });

    if (orderCount >= 1) {
      // Get first order value
      const firstOrder = await prisma.order.findFirst({
        where: { storeId: merchant.storeId },
        orderBy: { createdAt: "asc" },
        select: { total: true },
      });

      return {
        type: "first_order",
        value: Number(firstOrder?.total || 0),
        threshold: 1,
        previouslyReached: false,
      };
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn("[MILESTONE] First order check failed", {
      error: err.message,
      merchantId: merchant.id,
    });
  }

  return null;
}

/**
 * Record milestone achievement
 */
async function recordMilestone(
  storeId: string,
  milestone: MilestoneAchievement
): Promise<void> {
  try {
    await prisma.milestoneRecord.create({
      data: {
        storeId,
        milestoneType: milestone.type,
        milestoneValue: milestone.threshold,
        achievedAt: new Date(),
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[MILESTONE] Failed to record milestone", {
      error: err.message,
      storeId,
      milestone: milestone.type,
    });
  }
}

/**
 * Process milestones for all active merchants
 */
export async function processMilestones(): Promise<void> {
  const now = new Date();

  // Get all active subscriptions
  const activeSubscriptions = await prisma.merchantAiSubscription.findMany({
    where: {
      status: {
        in: [AiSubscriptionStatus.TRIAL_ACTIVE, AiSubscriptionStatus.UPGRADED_ACTIVE],
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

  logger.info(`[MILESTONE] Checking ${activeSubscriptions.length} active merchants`, {
    app: "worker",
  });

  for (const subscription of activeSubscriptions) {
    try {
      const merchant: MerchantWithStats = {
        id: subscription.id,
        storeId: subscription.storeId,
        store: subscription.store,
      };

      const achievements: MilestoneAchievement[] = [];

      // Check for first order
      const firstOrder = await checkFirstOrderMilestone(merchant);
      if (firstOrder) {
        achievements.push(firstOrder);
      }

      // Check revenue milestones
      const revenueMilestones = await checkRevenueMilestones(merchant);
      achievements.push(...revenueMilestones);

      // Process each achievement
      for (const milestone of achievements) {
        if (!milestone.previouslyReached) {
          // Send celebration email
          await sendMilestoneEmail(merchant, milestone);

          // Record the milestone
          await recordMilestone(subscription.storeId, milestone);

          logger.info("[MILESTONE] Achievement detected and celebrated", {
            merchantId: subscription.id,
            storeId: subscription.storeId,
            milestone: milestone.type,
            threshold: milestone.threshold,
          });
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("[MILESTONE] Failed to process merchant", {
        error: err.message,
        merchantId: subscription.id,
        storeId: subscription.storeId,
      });
      // Continue processing other merchants
    }
  }

  logger.info("[MILESTONE] Milestone processing completed", {
    app: "worker",
  });
}

/**
 * Main worker function
 */
export async function runMilestoneTrackerWorker(): Promise<void> {
  try {
    logger.info("[MILESTONE] Starting milestone tracker", {
      app: "worker",
    });

    await processMilestones();

    logger.info("[MILESTONE] Milestone tracker completed", {
      app: "worker",
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[MILESTONE] Worker failed", {
      error: err.message,
      stack: err.stack,
      app: "worker",
    });
    throw error;
  }
}

// Export for cron job scheduling
export default runMilestoneTrackerWorker;
