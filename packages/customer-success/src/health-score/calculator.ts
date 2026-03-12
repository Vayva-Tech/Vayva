/**
 * Health Score Calculator
 * Calculates merchant health scores based on engagement, usage, business metrics, support, and billing
 */

import { prisma } from '../lib/prisma';
import {
  HealthScoreResult,
  HealthMetrics,
  HealthFactor,
  HEALTH_SEGMENTS,
} from '../lib/types';
import {
  HEALTH_SCORE_WEIGHTS,
  ENGAGEMENT_THRESHOLDS,
  PRODUCT_USAGE_THRESHOLDS,
  BUSINESS_THRESHOLDS,
  SUPPORT_THRESHOLDS,
} from '../lib/constants';
import { subDays, differenceInDays, differenceInHours } from 'date-fns';

export class HealthScoreCalculator {
  /**
   * Calculate health score for a merchant
   */
  async calculate(storeId: string): Promise<HealthScoreResult> {
    // Get previous score for trend calculation
    const previousScoreRecord = await prisma.healthScore.findFirst({
      where: { storeId },
      orderBy: { calculatedAt: 'desc' },
    });

    // Gather all metrics
    const metrics = await this.gatherMetrics(storeId);

    // Calculate component scores
    const factors: HealthFactor[] = [];
    let totalScore = 100;

    // 1. Engagement Score (25%)
    const engagementScore = this.calculateEngagementScore(metrics, factors);

    // 2. Product Usage Score (35%)
    const productUsageScore = this.calculateProductUsageScore(metrics, factors);

    // 3. Business Health Score (25%)
    const businessHealthScore = this.calculateBusinessHealthScore(metrics, factors);

    // 4. Support Score (10%)
    const supportScore = this.calculateSupportScore(metrics, factors);

    // 5. Billing Score (5%)
    const billingScore = this.calculateBillingScore(metrics, factors);

    // Calculate weighted total
    totalScore = Math.round(
      engagementScore * (HEALTH_SCORE_WEIGHTS.ENGAGEMENT / 100) +
      productUsageScore * (HEALTH_SCORE_WEIGHTS.PRODUCT_USAGE / 100) +
      businessHealthScore * (HEALTH_SCORE_WEIGHTS.BUSINESS_HEALTH / 100) +
      supportScore * (HEALTH_SCORE_WEIGHTS.SUPPORT / 100) +
      billingScore * (HEALTH_SCORE_WEIGHTS.BILLING / 100)
    );

    // Ensure score is within bounds
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Determine trend
    const trend = this.calculateTrend(totalScore, previousScoreRecord?.score ?? null);

    const result: HealthScoreResult = {
      storeId,
      score: totalScore,
      factors,
      calculatedAt: new Date(),
      previousScore: previousScoreRecord?.score ?? undefined,
      trend,
    };

    // Save to database
    await this.saveHealthScore(result, metrics);

    return result;
  }

  /**
   * Gather all metrics for health score calculation
   */
  private async gatherMetrics(storeId: string): Promise<HealthMetrics> {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);
    const sixtyDaysAgo = subDays(now, 60);

    // Get store with owner
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: true,
        subscription: true,
      },
    });

    if (!store) {
      throw new Error(`Store not found: ${storeId}`);
    }

    // Get login activity (from AuditLog)
    const loginActivity = await prisma.auditLog.findMany({
      where: {
        targetStoreId: storeId,
        action: { contains: 'LOGIN', mode: 'insensitive' },
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    const lastLogin = loginActivity[0]?.createdAt ?? store.createdAt;
    const daysSinceLogin = differenceInDays(now, lastLogin);
    const sessions30d = loginActivity.length;
    const sessions7d = loginActivity.filter(l => l.createdAt >= sevenDaysAgo).length;

    // Get AI usage
    const aiUsage30d = await prisma.aiUsageDaily.findMany({
      where: {
        storeId,
        date: { gte: thirtyDaysAgo },
      },
    });
    const aiConversations30d = aiUsage30d.reduce((sum, day) => sum + day.requestsCount, 0);

    // Get orders data
    const orders30d = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const ordersPrev30d = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    });

    const orderGrowth = ordersPrev30d.length > 0
      ? (orders30d.length - ordersPrev30d.length) / ordersPrev30d.length
      : 0;

    const revenue30d = orders30d.reduce((sum, o) => sum + Number(o.total), 0);
    const revenuePrev30d = ordersPrev30d.reduce((sum, o) => sum + Number(o.total), 0);
    const revenueGrowth = revenuePrev30d > 0
      ? (revenue30d - revenuePrev30d) / revenuePrev30d
      : 0;

    // Get customer count
    const customerCount = await prisma.customer.count({
      where: { storeId },
    });

    const avgOrderValue = orders30d.length > 0
      ? revenue30d / orders30d.length
      : 0;

    // Get support tickets
    const supportTickets30d = await prisma.supportTicket.findMany({
      where: {
        storeId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const openTickets = await prisma.supportTicket.count({
      where: {
        storeId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    });

    const resolvedTickets = supportTickets30d.filter(t => t.resolvedAt);
    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => {
          if (t.resolvedAt && t.createdAt) {
            return sum + differenceInHours(t.resolvedAt, t.createdAt);
          }
          return sum;
        }, 0) / resolvedTickets.length
      : 0;

    // Calculate feature adoption
    const featuresUsed = await this.detectFeaturesUsed(storeId);
    const featureAdoption = featuresUsed.length / 12; // 12 tracked features

    return {
      daysSinceLogin,
      loginFrequency7d: sessions7d,
      sessionCount30d: sessions30d,
      featureAdoption,
      featuresUsed,
      aiConversations30d,
      ordersCreated30d: orders30d.length,
      orderGrowth,
      revenueGrowth,
      customerCount,
      avgOrderValue,
      supportTickets30d: supportTickets30d.length,
      avgResolutionTime,
      openTickets,
      subscriptionStatus: this.mapSubscriptionStatus(store.subscription?.status),
      daysToRenewal: store.subscription?.currentPeriodEnd
        ? differenceInDays(new Date(store.subscription.currentPeriodEnd), now)
        : 0,
      paymentFailures30d: 0, // Would need payment failure tracking
    };
  }

  /**
   * Calculate engagement score component
   */
  private calculateEngagementScore(metrics: HealthMetrics, factors: HealthFactor[]): number {
    let score = 100;

    // Days since login
    if (metrics.daysSinceLogin > ENGAGEMENT_THRESHOLDS.DAYS_SINCE_LOGIN_CRITICAL) {
      score -= 25;
      factors.push({
        type: 'negative',
        category: 'engagement',
        description: `Last login ${metrics.daysSinceLogin} days ago`,
        recommendation: 'Send re-engagement campaign via WhatsApp',
        impact: -25,
      });
    } else if (metrics.daysSinceLogin > ENGAGEMENT_THRESHOLDS.DAYS_SINCE_LOGIN_WARNING) {
      score -= 15;
      factors.push({
        type: 'negative',
        category: 'engagement',
        description: `Last login ${metrics.daysSinceLogin} days ago`,
        recommendation: 'Check in with merchant',
        impact: -15,
      });
    } else if (metrics.daysSinceLogin <= 1) {
      score += 5;
      factors.push({
        type: 'positive',
        category: 'engagement',
        description: 'Active daily user',
        impact: 5,
      });
    }

    // Session frequency
    if (metrics.sessionCount30d < ENGAGEMENT_THRESHOLDS.MIN_SESSIONS_30D) {
      score -= 10;
      factors.push({
        type: 'negative',
        category: 'engagement',
        description: `Only ${metrics.sessionCount30d} sessions in last 30 days`,
        recommendation: 'Schedule onboarding session',
        impact: -10,
      });
    } else if (metrics.sessionCount30d > 20) {
      score += 5;
      factors.push({
        type: 'positive',
        category: 'engagement',
        description: 'Highly engaged user',
        impact: 5,
      });
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate product usage score component
   */
  private calculateProductUsageScore(metrics: HealthMetrics, factors: HealthFactor[]): number {
    let score = 100;

    // Feature adoption
    if (metrics.featureAdoption < PRODUCT_USAGE_THRESHOLDS.MIN_FEATURE_ADOPTION) {
      const adoptionPct = Math.round(metrics.featureAdoption * 100);
      score -= 20;
      factors.push({
        type: 'negative',
        category: 'product_usage',
        description: `Using only ${adoptionPct}% of available features`,
        recommendation: 'Schedule feature training session',
        impact: -20,
      });
    } else if (metrics.featureAdoption > 0.7) {
      score += 10;
      factors.push({
        type: 'positive',
        category: 'product_usage',
        description: 'Excellent feature adoption',
        impact: 10,
      });
    }

    // AI usage
    if (metrics.aiConversations30d < PRODUCT_USAGE_THRESHOLDS.MIN_AI_CONVERSATIONS_30D) {
      score -= 10;
      factors.push({
        type: 'negative',
        category: 'product_usage',
        description: `Only ${metrics.aiConversations30d} AI conversations in 30 days`,
        recommendation: 'Showcase AI agent capabilities',
        impact: -10,
      });
    } else if (metrics.aiConversations30d > 50) {
      score += 5;
      factors.push({
        type: 'positive',
        category: 'product_usage',
        description: 'Heavy AI usage - power user',
        impact: 5,
      });
    }

    // Order creation activity
    if (metrics.ordersCreated30d < PRODUCT_USAGE_THRESHOLDS.MIN_ORDERS_CREATED_30D && metrics.daysSinceLogin < 7) {
      score -= 10;
      factors.push({
        type: 'negative',
        category: 'product_usage',
        description: 'Low order activity',
        recommendation: 'Review product catalog and pricing',
        impact: -10,
      });
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate business health score component
   */
  private calculateBusinessHealthScore(metrics: HealthMetrics, factors: HealthFactor[]): number {
    let score = 100;

    // Order growth
    if (metrics.orderGrowth < BUSINESS_THRESHOLDS.ORDER_GROWTH_CRITICAL) {
      const declinePct = Math.abs(Math.round(metrics.orderGrowth * 100));
      score -= 15;
      factors.push({
        type: 'negative',
        category: 'business_health',
        description: `Order volume down ${declinePct}%`,
        recommendation: 'Offer business consultation and marketing tips',
        impact: -15,
      });
    } else if (metrics.orderGrowth < BUSINESS_THRESHOLDS.ORDER_GROWTH_WARNING) {
      const declinePct = Math.abs(Math.round(metrics.orderGrowth * 100));
      score -= 10;
      factors.push({
        type: 'negative',
        category: 'business_health',
        description: `Order volume down ${declinePct}%`,
        recommendation: 'Review autopilot suggestions',
        impact: -10,
      });
    } else if (metrics.orderGrowth > 0.2) {
      score += 10;
      factors.push({
        type: 'positive',
        category: 'business_health',
        description: `Order volume up ${Math.round(metrics.orderGrowth * 100)}%`,
        impact: 10,
      });
    }

    // Revenue growth
    if (metrics.revenueGrowth > 0.3) {
      score += 5;
      factors.push({
        type: 'positive',
        category: 'business_health',
        description: 'Strong revenue growth',
        impact: 5,
      });
    }

    // Customer base
    if (metrics.customerCount === 0 && metrics.daysSinceLogin < 30) {
      score -= 10;
      factors.push({
        type: 'negative',
        category: 'business_health',
        description: 'No customers acquired yet',
        recommendation: 'Provide marketing strategy guidance',
        impact: -10,
      });
    } else if (metrics.customerCount > 50) {
      score += 5;
      factors.push({
        type: 'positive',
        category: 'business_health',
        description: 'Strong customer base',
        impact: 5,
      });
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate support score component
   */
  private calculateSupportScore(metrics: HealthMetrics, factors: HealthFactor[]): number {
    let score = 100;

    // Ticket volume
    if (metrics.supportTickets30d > SUPPORT_THRESHOLDS.MAX_TICKETS_30D) {
      score -= 15;
      factors.push({
        type: 'negative',
        category: 'support',
        description: `${metrics.supportTickets30d} support tickets in 30 days`,
        recommendation: 'Proactive outreach to address recurring issues',
        impact: -15,
      });
    }

    // Open tickets
    if (metrics.openTickets > SUPPORT_THRESHOLDS.MAX_OPEN_TICKETS) {
      score -= 10;
      factors.push({
        type: 'negative',
        category: 'support',
        description: `${metrics.openTickets} unresolved tickets`,
        recommendation: 'Escalate to support team lead',
        impact: -10,
      });
    }

    // Resolution time
    if (metrics.avgResolutionTime > SUPPORT_THRESHOLDS.MAX_RESOLUTION_HOURS) {
      score -= 10;
      factors.push({
        type: 'negative',
        category: 'support',
        description: 'Slow ticket resolution time',
        recommendation: 'Review support processes',
        impact: -10,
      });
    } else if (metrics.avgResolutionTime > 0 && metrics.avgResolutionTime < 12) {
      score += 5;
      factors.push({
        type: 'positive',
        category: 'support',
        description: 'Fast support resolution',
        impact: 5,
      });
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate billing score component
   */
  private calculateBillingScore(metrics: HealthMetrics, factors: HealthFactor[]): number {
    let score = 100;

    // Subscription status
    if (metrics.subscriptionStatus === 'past_due') {
      score -= 20;
      factors.push({
        type: 'negative',
        category: 'billing',
        description: 'Payment past due',
        recommendation: 'Immediate billing outreach',
        impact: -20,
      });
    } else if (metrics.subscriptionStatus === 'canceled') {
      score -= 30;
      factors.push({
        type: 'negative',
        category: 'billing',
        description: 'Subscription canceled',
        recommendation: 'Win-back campaign',
        impact: -30,
      });
    } else if (metrics.subscriptionStatus === 'trial') {
      if (metrics.daysToRenewal <= 3) {
        score -= 10;
        factors.push({
          type: 'negative',
          category: 'billing',
          description: 'Trial ending soon',
          recommendation: 'Trial conversion outreach',
          impact: -10,
        });
      }
    }

    // Payment failures
    if (metrics.paymentFailures30d > 0) {
      score -= 10 * metrics.paymentFailures30d;
      factors.push({
        type: 'negative',
        category: 'billing',
        description: `${metrics.paymentFailures30d} payment failures`,
        recommendation: 'Payment method update required',
        impact: -10 * metrics.paymentFailures30d,
      });
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect which features a merchant is using
   */
  private async detectFeaturesUsed(storeId: string): Promise<string[]> {
    const features: string[] = [];

    // Check AI agent usage
    const aiUsage = await prisma.aiUsageDaily.findFirst({
      where: { storeId },
    });
    if (aiUsage && aiUsage.requestsCount > 0) features.push('ai_agent');

    // Check WhatsApp integration
    const whatsappSettings = await prisma.whatsAppAgentSettings.findUnique({
      where: { storeId },
    });
    if (whatsappSettings?.enabled) features.push('whatsapp_integration');

    // Check product catalog
    const productCount = await prisma.product.count({ where: { storeId } });
    if (productCount > 0) features.push('product_catalog');

    // Check orders
    const orderCount = await prisma.order.count({ where: { storeId } });
    if (orderCount > 0) features.push('order_management');

    // Check payments (via orders with payments)
    const paymentCount = await prisma.payment.count({
      where: { order: { storeId } },
    });
    if (paymentCount > 0) features.push('payment_processing');

    // Check delivery
    const deliveryCount = await prisma.delivery.count({
      where: { order: { storeId } },
    });
    if (deliveryCount > 0) features.push('delivery_integration');

    // Check analytics (has daily stats)
    const analyticsCount = await prisma.analyticsDailySales.findFirst({
      where: { storeId },
    });
    if (analyticsCount) features.push('analytics_dashboard');

    // Check autopilot
    const autopilotRules = await prisma.autopilotRule.count({
      where: { storeId },
    });
    if (autopilotRules > 0) features.push('autopilot_rules');

    // Check customer segmentation
    const segments = await prisma.customerSegment.count({
      where: { storeId },
    });
    if (segments > 0) features.push('customer_segmentation');

    // Check inventory
    const inventory = await prisma.inventoryItem.count({
      where: { storeId },
    });
    if (inventory > 0) features.push('inventory_management');

    // Check subscription
    const subscription = await prisma.subscription.findUnique({
      where: { storeId },
    });
    if (subscription) features.push('subscription_billing');

    // Check webhooks
    const webhooks = await prisma.webhook.count({
      where: { storeId },
    });
    if (webhooks > 0) features.push('webhook_integration');

    return features;
  }

  /**
   * Calculate trend compared to previous score
   */
  private calculateTrend(currentScore: number, previousScore: number | null): 'improving' | 'declining' | 'stable' {
    if (previousScore === null) return 'stable';

    const diff = currentScore - previousScore;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  /**
   * Save health score to database
   */
  private async saveHealthScore(result: HealthScoreResult, metrics: HealthMetrics): Promise<void> {
    await prisma.healthScore.create({
      data: {
        storeId: result.storeId,
        date: new Date(),
        score: result.score,
        components: {
          factors: result.factors,
          metrics,
          trend: result.trend,
        },
      },
    });
  }

  /**
   * Map subscription status to health metric status
   */
  private mapSubscriptionStatus(status?: string): 'active' | 'trial' | 'past_due' | 'canceled' {
    if (!status) return 'trial';
    const normalized = status.toLowerCase();
    if (normalized.includes('active')) return 'active';
    if (normalized.includes('trial')) return 'trial';
    if (normalized.includes('past_due') || normalized.includes('pastdue')) return 'past_due';
    if (normalized.includes('cancel')) return 'canceled';
    return 'trial';
  }

  /**
   * Get health segment for a score
   */
  static getSegment(score: number): typeof HEALTH_SEGMENTS[0] {
    return HEALTH_SEGMENTS.find(
      s => score >= s.minScore && score <= s.maxScore
    ) || HEALTH_SEGMENTS[2]; // Default to critical
  }

  /**
   * Batch calculate health scores for all merchants
   */
  async calculateAll(batchSize: number = 100): Promise<{ processed: number; errors: number }> {
    const stores = await prisma.store.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    let processed = 0;
    let errors = 0;

    for (let i = 0; i < stores.length; i += batchSize) {
      const batch = stores.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (store) => {
          try {
            await this.calculate(store.id);
            processed++;
          } catch (error) {
            errors++;
            console.error(`Failed to calculate health score for ${store.id}:`, error);
          }
        })
      );
    }

    return { processed, errors };
  }
}

// Export singleton instance
export const healthScoreCalculator = new HealthScoreCalculator();
