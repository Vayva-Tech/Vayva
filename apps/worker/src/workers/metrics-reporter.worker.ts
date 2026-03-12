import { Worker, Queue } from "bullmq";
import { logger, QUEUES } from "@vayva/shared";
import { getRedis } from "@vayva/redis";
import { prisma, SubscriptionStatus, PlanType } from "@vayva/db";

interface BusinessMetrics {
  date: string;
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  newTrials: number;
  trialToPaidConversions: number;
  trialConversionRate: number;
  churnedSubscriptions: number;
  churnRate: number;
  netRevenueRetention: number;
  averageRevenuePerUser: number;
  planDistribution: Record<PlanType, number>;
  failedPayments: number;
  gracePeriodEntries: number;
}

/**
 * Calculate monthly recurring revenue
 */
async function calculateMRR(): Promise<number> {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL_ACTIVE],
      },
    },
    select: {
      plan: true,
      currency: true,
    },
  });

  const planPrices: Record<PlanType, number> = {
    FREE: 0,
    STARTER: 29,
    PRO: 99,
    ENTERPRISE: 499,
  };

  // Convert all to USD (simplified - in production use exchange rates)
  const exchangeRates: Record<string, number> = {
    USD: 1,
    NGN: 0.00065, // Approximate
    GBP: 1.27,
    EUR: 1.09,
  };

  let totalMRR = 0;
  for (const sub of activeSubscriptions) {
    const basePrice = planPrices[sub.plan] || 0;
    const rate = exchangeRates[sub.currency] || 1;
    totalMRR += basePrice * rate;
  }

  return Math.round(totalMRR * 100) / 100;
}

/**
 * Calculate active subscription counts
 */
async function getActiveSubscriptionCount(): Promise<number> {
  return prisma.subscription.count({
    where: {
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL_ACTIVE],
      },
    },
  });
}

/**
 * Get new trials started today
 */
async function getNewTrials(date: Date): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.subscription.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: SubscriptionStatus.TRIAL_ACTIVE,
    },
  });
}

/**
 * Get trial to paid conversions
 */
async function getTrialConversions(date: Date): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.auditLog.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      action: "subscription.activated",
      details: {
        path: ["previousStatus"],
        equals: "TRIAL_ACTIVE",
      },
    },
  });
}

/**
 * Calculate churn metrics
 */
async function getChurnMetrics(date: Date): Promise<{ churned: number; rate: number }> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const churned = await prisma.subscription.count({
    where: {
      updatedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: SubscriptionStatus.SUSPENDED,
    },
  });

  const totalActiveAtStart = await prisma.subscription.count({
    where: {
      createdAt: {
        lt: startOfDay,
      },
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL_ACTIVE],
      },
    },
  });

  const rate = totalActiveAtStart > 0 ? (churned / totalActiveAtStart) * 100 : 0;

  return { churned, rate: Math.round(rate * 100) / 100 };
}

/**
 * Get plan distribution
 */
async function getPlanDistribution(): Promise<Record<PlanType, number>> {
  const distribution = await prisma.subscription.groupBy({
    by: ["plan"],
    where: {
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL_ACTIVE],
      },
    },
    _count: {
      plan: true,
    },
  });

  const result: Record<string, number> = {
    FREE: 0,
    STARTER: 0,
    PRO: 0,
    ENTERPRISE: 0,
  };

  for (const item of distribution) {
    result[item.plan] = item._count.plan;
  }

  return result as Record<PlanType, number>;
}

/**
 * Get failed payment count
 */
async function getFailedPayments(date: Date): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.auditLog.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      action: "payment.failed",
    },
  });
}

/**
 * Get grace period entries
 */
async function getGracePeriodEntries(date: Date): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.auditLog.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      action: "subscription.grace_period",
    },
  });
}

/**
 * Calculate and store business metrics
 */
async function calculateAndStoreMetrics(): Promise<BusinessMetrics> {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  logger.info("[MetricsReporter] Calculating business metrics", { date: dateStr });

  const [
    mrr,
    activeSubscriptions,
    newTrials,
    trialConversions,
    { churned: churnedSubscriptions, rate: churnRate },
    planDistribution,
    failedPayments,
    gracePeriodEntries,
  ] = await Promise.all([
    calculateMRR(),
    getActiveSubscriptionCount(),
    getNewTrials(today),
    getTrialConversions(today),
    getChurnMetrics(today),
    getPlanDistribution(),
    getFailedPayments(today),
    getGracePeriodEntries(today),
  ]);

  const arr = mrr * 12;
  const trialConversionRate = newTrials > 0 ? (trialConversions / newTrials) * 100 : 0;
  const averageRevenuePerUser = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;

  // Calculate NRR (simplified - compare to previous month)
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const netRevenueRetention = 100; // Placeholder - would need historical data

  const metrics: BusinessMetrics = {
    date: dateStr,
    mrr,
    arr,
    activeSubscriptions,
    newTrials,
    trialToPaidConversions: trialConversions,
    trialConversionRate: Math.round(trialConversionRate * 100) / 100,
    churnedSubscriptions,
    churnRate,
    netRevenueRetention,
    averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
    planDistribution,
    failedPayments,
    gracePeriodEntries,
  };

  // Store metrics in database
  await prisma.businessMetric.create({
    data: {
      date: new Date(dateStr),
      mrr: metrics.mrr,
      arr: metrics.arr,
      activeSubscriptions: metrics.activeSubscriptions,
      newTrials: metrics.newTrials,
      trialConversions: metrics.trialToPaidConversions,
      trialConversionRate: metrics.trialConversionRate,
      churnedSubscriptions: metrics.churnedSubscriptions,
      churnRate: metrics.churnRate,
      netRevenueRetention: metrics.netRevenueRetention,
      averageRevenuePerUser: metrics.averageRevenuePerUser,
      planDistribution: metrics.planDistribution as unknown as Prisma.InputJsonValue,
      failedPayments: metrics.failedPayments,
      gracePeriodEntries: metrics.gracePeriodEntries,
    },
  });

  logger.info("[MetricsReporter] Metrics calculated and stored", metrics);

  // Send alert if critical thresholds breached
  if (churnRate > 10) {
    logger.warn("[MetricsReporter] High churn rate detected", { churnRate });
  }
  if (failedPayments > 20) {
    logger.warn("[MetricsReporter] High failed payment count", { failedPayments });
  }

  return metrics;
}

/**
 * Register the metrics reporter worker
 */
export function registerMetricsReporterWorker(connection: ReturnType<typeof getRedis>): Worker {
  const worker = new Worker(
    QUEUES.METRICS_REPORTER,
    async (job) => {
      logger.info("[MetricsReporter] Processing job", { jobId: job.id });

      try {
        const metrics = await calculateAndStoreMetrics();
        return { success: true, metrics };
      } catch (error) {
        logger.error("[MetricsReporter] Failed to calculate metrics", { error });
        throw error;
      }
    },
    { connection, concurrency: 1 }
  );

  worker.on("completed", (job) => {
    logger.info("[MetricsReporter] Job completed", { jobId: job.id });
  });

  worker.on("failed", (job, err) => {
    logger.error("[MetricsReporter] Job failed", { jobId: job?.id, error: err });
  });

  logger.info("[MetricsReporter] Worker registered");
  return worker;
}

/**
 * Schedule daily metrics reporting job
 */
export async function scheduleMetricsReporterJobs(queue: Queue): Promise<void> {
  // Schedule daily at 6 AM (after subscription lifecycle runs at 2 AM)
  await queue.add(
    "daily-metrics",
    {},
    {
      repeat: { pattern: "0 6 * * *" },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  logger.info("[MetricsReporter] Daily job scheduled");
}
