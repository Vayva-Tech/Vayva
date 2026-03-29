import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface UsageReport {
  stats: Record<string, number>;
  totalOverageCost: number;
  recommendations: string[];
}

export class BillingService {
  constructor(private readonly db = prisma) {}

  /**
   * Get quota status for a user
   */
  async getQuotaStatus(userId: string) {
    const subscription = await this.db.merchantAiSubscription.findUnique({
      where: { storeId: userId },
      include: { plan: true, addonPurchases: true }
    });

    if (!subscription) {
      throw new Error('No subscription found');
    }

    return {
      currentTier: subscription.planKey,
      trialActive: this.isTrialExpired(subscription),
      subscription
    };
  }

  /**
   * Purchase an addon pack
   */
  async purchaseAddon(
    userId: string,
    metric: string,
    quantity: number
  ) {
    const validMetrics = ['AI_TOKENS', 'WHATSAPP_MESSAGES', 'STORAGE_GB', 'API_CALLS'];
    
    if (!validMetrics.includes(metric)) {
      throw new Error(`Invalid metric. Valid options: ${validMetrics.join(', ')}`);
    }

    const addonPrices: Record<string, { price: number; increment: number }> = {
      'AI_TOKENS': { price: 5000, increment: 10000 },
      'WHATSAPP_MESSAGES': { price: 5000, increment: 100 },
      'STORAGE_GB': { price: 5000, increment: 10 },
      'API_CALLS': { price: 5000, increment: 1000 }
    };

    const pricing = addonPrices[metric];
    if (!pricing) {
      throw new Error('Addon not available for this metric');
    }

    // Create addon purchase record
    const addonPurchase = await this.db.addonPurchase.create({
      data: {
        id: `addon_${Date.now()}`,
        subscriptionId: userId,
        metric,
        quantity: pricing.increment * quantity,
        price: pricing.price * quantity,
        purchasedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE'
      }
    });

    logger.info('[Billing] Addon purchased', {
      userId,
      metric,
      quantity,
      addonId: addonPurchase.id
    });

    return {
      id: addonPurchase.id,
      name: `${metric.replace('_', ' ')} Addon`,
      description: `Additional ${quantity} ${metric.toLowerCase()}`,
      priceNgn: pricing.price * quantity,
      metrics: {
        [metric]: pricing.increment * quantity
      },
      purchasedAt: addonPurchase.purchasedAt,
      expiresAt: addonPurchase.expiresAt
    };
  }

  /**
   * Check if trial is expired
   */
  private isTrialExpired(subscription: any): boolean {
    if (!subscription.trialExpiresAt) {
      return false;
    }
    return new Date() > subscription.trialExpiresAt;
  }

  /**
   * Generate usage report
   */
  async generateUsageReport(userId: string): Promise<UsageReport> {
    const subscription = await this.db.merchantAiSubscription.findUnique({
      where: { storeId: userId },
      include: { addonPurchases: true }
    });

    if (!subscription) {
      return {
        stats: {},
        totalOverageCost: 0,
        recommendations: []
      };
    }

    // Mock implementation - would integrate with actual usage tracking
    return {
      stats: {
        aiTokens: 0,
        whatsappMessages: 0,
        storageGB: 0,
        apiCalls: 0
      },
      totalOverageCost: 0,
      recommendations: []
    };
  }
}
