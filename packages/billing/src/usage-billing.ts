/**
 * Usage-Based Billing Service
 * 
 * Handles:
 * - Recording usage events
 * - Calculating monthly bills with overages
 * - Threshold alerts
 * - Usage projections
 */

import { prisma, Prisma, UsageMetric, AiSubscriptionStatus } from '@vayva/db';
import { logger } from '@vayva/shared';
import { 
  type UsageRecord, 
  type UsageStats, 
  type LineItem,
  OVERAGE_RATES,
  PLAN_LIMITS,
} from './types';

export class UsageBillingService {
  /**
   * Record a usage event
   */
  static async recordUsage(params: UsageRecord): Promise<void> {
    const { storeId, metric, quantity, metadata } = params;

    try {
      // Get current period
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Calculate cost
      const unitCost = OVERAGE_RATES[metric];
      const totalCost = Math.floor(quantity * unitCost);

      // Create usage event
      await prisma.usageEvent.create({
        data: {
          storeId,
          metric,
          quantity,
          unitCost: BigInt(Math.floor(unitCost * 100)), // Store in kobo
          totalCost: BigInt(totalCost),
          periodStart,
          periodEnd,
          metadata: metadata || {},
        },
      });

      // Check thresholds
      await this.checkThresholds(storeId, metric);

      logger.info('[UsageBilling] Recorded usage', {
        storeId,
        metric,
        quantity,
        cost: totalCost,
      });
    } catch (error) {
      logger.error('[UsageBilling] Failed to record usage', {
        error,
        storeId,
        metric,
      });
      throw error;
    }
  }

  /**
   * Get usage statistics for a store
   */
  static async getUsageStats(storeId: string): Promise<UsageStats[]> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get subscription to determine limits
    const subscription = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
      include: { plan: true },
    });

    const planKey = subscription?.planKey || 'STARTER';
    const limits = PLAN_LIMITS[planKey] || PLAN_LIMITS.STARTER;

    // Aggregate usage by metric
    const usageAggregates = await prisma.usageEvent.groupBy({
      by: ['metric'],
      where: {
        storeId,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
      _sum: {
        quantity: true,
      },
    });

    // Get AI usage from existing AiUsageDaily
    const aiUsage = await prisma.aiUsageDaily.findMany({
      where: {
        storeId,
        date: { gte: periodStart, lte: periodEnd },
      },
    });

    const totalTokens = aiUsage.reduce((sum, day) => sum + day.tokensCount, 0);
    const totalMessages = await prisma.aiUsageEvent.count({
      where: {
        storeId,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    });

    // Build stats for each metric
    const stats: UsageStats[] = [];

    // AI Tokens
    const tokenLimit = limits.aiTokens;
    const tokenPercentage = Math.min(100, Math.round((totalTokens / tokenLimit) * 100));
    const tokenOverage = Math.max(0, totalTokens - tokenLimit);
    stats.push({
      metric: 'AI_TOKENS',
      used: totalTokens,
      limit: tokenLimit,
      percentage: tokenPercentage,
      projected: this.projectUsage(totalTokens, periodStart, periodEnd),
      overage: tokenOverage,
      overageCost: Math.floor(tokenOverage * OVERAGE_RATES.AI_TOKENS),
    });

    // WhatsApp Messages
    const messageLimit = limits.whatsappMessages;
    const messagePercentage = Math.min(100, Math.round((totalMessages / messageLimit) * 100));
    const messageOverage = Math.max(0, totalMessages - messageLimit);
    stats.push({
      metric: 'WHATSAPP_MESSAGES',
      used: totalMessages,
      limit: messageLimit,
      percentage: messagePercentage,
      projected: this.projectUsage(totalMessages, periodStart, periodEnd),
      overage: messageOverage,
      overageCost: Math.floor(messageOverage * OVERAGE_RATES.WHATSAPP_MESSAGES),
    });

    // Other metrics from usage events
    const metricMap: Record<string, keyof typeof limits> = {
      'STORAGE_GB': 'storageGB',
      'API_CALLS': 'apiCalls',
    };

    for (const agg of usageAggregates) {
      const limitKey = metricMap[agg.metric];
      if (!limitKey) continue;

      const limit = limits[limitKey];
      const used = agg._sum.quantity || 0;
      const percentage = Math.min(100, Math.round((used / limit) * 100));
      const overage = Math.max(0, used - limit);

      stats.push({
        metric: agg.metric as UsageMetric,
        used,
        limit,
        percentage,
        projected: this.projectUsage(used, periodStart, periodEnd),
        overage,
        overageCost: Math.floor(overage * OVERAGE_RATES[agg.metric as UsageMetric]),
      });
    }

    return stats;
  }

  /**
   * Calculate monthly bill with overages
   */
  static async calculateMonthlyBill(storeId: string): Promise<{
    baseAmount: number;
    overageAmount: number;
    totalAmount: number;
    lineItems: LineItem[];
  }> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get subscription
    const subscription = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // Get base plan price (you'll need to add this to your AiPlan model)
    const baseAmount = this.getPlanBasePrice(subscription.planKey);

    // Get usage stats
    const stats = await this.getUsageStats(storeId);

    // Calculate overages
    const lineItems: LineItem[] = [];
    let overageAmount = 0;

    for (const stat of stats) {
      if (stat.overage > 0) {
        const overageCost = stat.overageCost;
        overageAmount += overageCost;

        lineItems.push({
          description: `${this.formatMetricName(stat.metric)} Overage`,
          quantity: stat.overage,
          unitCost: OVERAGE_RATES[stat.metric],
          amount: overageCost,
        });
      }
    }

    return {
      baseAmount,
      overageAmount,
      totalAmount: baseAmount + overageAmount,
      lineItems,
    };
  }

  /**
   * Create a usage invoice
   */
  static async createInvoice(storeId: string): Promise<string> {
    const bill = await this.calculateMonthlyBill(storeId);
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const invoiceNumber = `INV-${storeId.slice(0, 8)}-${Date.now()}`;

    const invoice = await prisma.usageInvoice.create({
      data: {
        storeId,
        invoiceNumber,
        periodStart,
        periodEnd,
        baseAmount: BigInt(bill.baseAmount),
        overageAmount: BigInt(bill.overageAmount),
        totalAmount: BigInt(bill.totalAmount),
        lineItems: bill.lineItems as unknown as Prisma.InputJsonValue,
        status: 'PENDING_PAYMENT',
      },
    });

    logger.info('[UsageBilling] Created invoice', {
      invoiceId: invoice.id,
      storeId,
      totalAmount: bill.totalAmount,
    });

    return invoice.id;
  }

  /**
   * Check usage thresholds and trigger alerts
   */
  private static async checkThresholds(
    storeId: string,
    metric: UsageMetric
  ): Promise<void> {
    const stats = await this.getUsageStats(storeId);
    const stat = stats.find(s => s.metric === metric);

    if (!stat) return;

    const thresholds = [80, 100];

    for (const threshold of thresholds) {
      if (stat.percentage >= threshold) {
        // Check if already triggered
        const existing = await prisma.usageThresholdAlert.findUnique({
          where: {
            storeId_metric_threshold: {
              storeId,
              metric,
              threshold,
            },
          },
        });

        if (!existing) {
          await prisma.usageThresholdAlert.create({
            data: {
              storeId,
              metric,
              threshold,
              triggered: true,
              triggeredAt: new Date(),
            },
          });

          logger.info('[UsageBilling] Threshold alert triggered', {
            storeId,
            metric,
            threshold,
            percentage: stat.percentage,
          });
        }
      }
    }
  }

  /**
   * Project usage to end of month
   */
  private static projectUsage(
    currentUsage: number,
    periodStart: Date,
    periodEnd: Date
  ): number {
    const now = new Date();
    const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

    if (daysElapsed === 0) return currentUsage;

    const dailyRate = currentUsage / daysElapsed;
    return Math.round(dailyRate * totalDays);
  }

  /**
   * Get base plan price (in kobo)
   */
  private static getPlanBasePrice(planKey: string): number {
    const prices: Record<string, number> = {
      'STARTER': 0, // Free trial
      'GROWTH': 1500000, // ₦15,000
      'PRO': 5000000, // ₦50,000
    };
    return prices[planKey] || 0;
  }

  /**
   * Format metric name for display
   */
  private static formatMetricName(metric: UsageMetric): string {
    const names: Record<UsageMetric, string> = {
      'AI_TOKENS': 'AI Tokens',
      'WHATSAPP_MESSAGES': 'WhatsApp Messages',
      'WHATSAPP_MEDIA': 'WhatsApp Media',
      'STORAGE_GB': 'Storage (GB)',
      'API_CALLS': 'API Calls',
      'BANDWIDTH_GB': 'Bandwidth (GB)',
    };
    return names[metric] || metric;
  }
}
