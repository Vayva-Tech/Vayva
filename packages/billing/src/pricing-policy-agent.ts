import type { PlanTier, TierLimits } from './tier-limits';
import type { UsageMetric } from './types';
import {
  TIER_LIMITS,
  TIER_TRIAL_PERIODS,
  canAccessIndustryDashboards,
  canUseAI,
  coercePlanTier,
} from './tier-limits';
import { logger } from '@vayva/shared';

/**
 * Centralized Pricing Policy Agent
 * 
 * This agent serves as the single source of truth for all pricing-related decisions
 * including tier validation, feature access, usage quotas, trial management, and
 * overage calculations.
 */

export interface UsageStats {
  metric: UsageMetric;
  used: number;
  limit: number;
  percentage: number;
  projected: number;
  overage: number;
  overageCost: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planKey: PlanTier;
  status: string;
  trialStartsAt?: Date;
  trialExpiresAt?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  usageQuotas?: Record<string, number>;
  addonPurchases?: AddonPurchase[];
}

export interface AddonPurchase {
  id: string;
  name: string;
  description: string;
  priceNgn: number;
  metrics: Record<UsageMetric, number>;
  purchasedAt: Date;
  expiresAt?: Date;
}

export interface PricingPolicy {
  // Tier access rules
  canAccessIndustryDashboards(tier: PlanTier): boolean;
  canUseAI(tier: PlanTier): boolean;
  canUseFeature(tier: PlanTier, feature: string): boolean;
  
  // Usage limits
  getUsageQuota(tier: PlanTier, metric: UsageMetric): number;
  checkUsageLimit(tier: PlanTier, metric: UsageMetric, current: number): {
    allowed: boolean;
    remaining: number;
    upgradeRequired: boolean;
  };
  
  // Trial management
  getTrialPeriod(tier: PlanTier): number;
  isTrialExpired(subscription: Subscription): boolean;
  
  // Overage handling
  calculateOverageCost(metric: UsageMetric, overage: number): number;
  shouldShowAddonPrompt(usage: UsageStats): boolean;
  
  // Upgrade recommendations
  getRecommendedUpgradePath(currentTier: PlanTier, usagePattern: Record<UsageMetric, number>): PlanTier | null;
}

// Overage pricing (in kobo per unit)
const OVERAGE_RATES: Record<UsageMetric, number> = {
  'AI_TOKENS': 0.5, // ₦0.005 per token
  'WHATSAPP_MESSAGES': 290, // ₦2.90 per message
  'WHATSAPP_MEDIA': 500, // ₦5.00 per media message
  'STORAGE_GB': 10000, // ₦100 per GB
  'API_CALLS': 1, // ₦0.01 per call
  'BANDWIDTH_GB': 5000, // ₦50 per GB
};

/**
 * Centralized Pricing Policy Agent Implementation
 */
export class PricingPolicyAgent implements PricingPolicy {
  /**
   * Check if a tier can access industry dashboards
   */
  canAccessIndustryDashboards(tier: PlanTier): boolean {
    return canAccessIndustryDashboards(tier);
  }

  /**
   * Check if a tier can use AI features
   */
  canUseAI(tier: PlanTier): boolean {
    return canUseAI(tier);
  }

  /**
   * Check if a tier can use a specific feature
   */
  canUseFeature(tier: PlanTier, feature: string): boolean {
    const limits = TIER_LIMITS[tier];
    if (!Object.prototype.hasOwnProperty.call(limits, feature)) {
      return false;
    }
    const limit = limits[feature as keyof TierLimits];
    return limit?.enabled ?? false;
  }

  /**
   * Get usage quota for a specific metric and tier
   */
  getUsageQuota(tier: PlanTier, metric: UsageMetric): number {
    // Convert metric to the format used in tier limits
    const metricMap: Record<UsageMetric, keyof TierLimits> = {
      'AI_TOKENS': 'aiTokens',
      'WHATSAPP_MESSAGES': 'whatsappMessages',
      'WHATSAPP_MEDIA': 'whatsappMessages', // Same quota bucket
      'STORAGE_GB': 'products', // Approximate mapping
      'API_CALLS': 'orders', // Approximate mapping
      'BANDWIDTH_GB': 'customers' // Approximate mapping
    };

    const tierFeature = metricMap[metric];
    if (!tierFeature) {
      return 0;
    }

    const limit = TIER_LIMITS[tier][tierFeature];
    return limit.quota || (typeof limit.maxItems === 'number' ? limit.maxItems : 0);
  }

  /**
   * Check if usage is within limits
   */
  checkUsageLimit(tier: PlanTier, metric: UsageMetric, current: number): {
    allowed: boolean;
    remaining: number;
    upgradeRequired: boolean;
  } {
    const limit = this.getUsageQuota(tier, metric);
    const remaining = Math.max(0, limit - current);
    const allowed = limit <= 0 ? true : current < limit;
    const upgradeRequired =
      limit > 0 ? current / limit > 0.8 : false;
    
    return { allowed, remaining, upgradeRequired };
  }

  /**
   * Get trial period for a tier
   */
  getTrialPeriod(tier: PlanTier): number {
    return TIER_TRIAL_PERIODS[tier];
  }

  /**
   * Check if trial period has expired
   */
  isTrialExpired(subscription: Subscription): boolean {
    if (!subscription.trialExpiresAt) return false;
    
    const now = new Date();
    return subscription.trialExpiresAt < now;
  }

  /**
   * Calculate overage cost for a metric
   */
  calculateOverageCost(metric: UsageMetric, overage: number): number {
    const rate = OVERAGE_RATES[metric] || 0;
    return Math.floor(overage * rate);
  }

  /**
   * Determine if addon prompt should be shown based on usage
   */
  shouldShowAddonPrompt(usage: UsageStats): boolean {
    // Show prompt if:
    // 1. Usage is between 80-100% of limit
    // 2. Projected usage will exceed limit
    // 3. There's overage but under 200% of limit
    
    const { percentage, projected, limit, used } = usage;
    
    if (percentage >= 80 && percentage < 100) return true;
    if (projected > limit) return true;
    if (used > limit && used <= limit * 2) return true;
    
    return false;
  }

  /**
   * Get recommended upgrade path based on usage patterns
   */
  getRecommendedUpgradePath(currentTier: PlanTier, usagePattern: Record<UsageMetric, number>): PlanTier | null {
    let needsUpgrade = false;

    for (const [metric, usage] of Object.entries(usagePattern)) {
      const limit = this.getUsageQuota(currentTier, metric as UsageMetric);
      if (limit > 0 && usage > limit * 0.8) {
        needsUpgrade = true;
        break;
      }
    }

    if (!needsUpgrade) return null;

    const tierOrder: PlanTier[] = ["STARTER", "PRO", "PRO_PLUS"];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    if (currentIndex < tierOrder.length - 1) {
      return tierOrder[currentIndex + 1];
    }
    
    return null; // Already on highest tier
  }

  /**
   * Generate usage report for a subscription
   */
  async generateUsageReport(subscription: Subscription): Promise<{
    stats: UsageStats[];
    totalOverageCost: number;
    recommendations: string[];
  }> {
    try {
      // This would integrate with actual usage tracking
      // For now, returning mock data based on subscription tier
      
      const stats: UsageStats[] = [];
      const recommendations: string[] = [];
      
      // Mock usage data - in real implementation, this would come from database
      const mockUsage: Record<UsageMetric, number> = {
        'AI_TOKENS': 5000,
        'WHATSAPP_MESSAGES': 200,
        'WHATSAPP_MEDIA': 50,
        'STORAGE_GB': 5,
        'API_CALLS': 1500,
        'BANDWIDTH_GB': 20
      };
      
      let totalOverageCost = 0;
      
      // Generate stats for each metric
      const tier = coercePlanTier(String(subscription.planKey));
      for (const [metric, used] of Object.entries(mockUsage)) {
        const limit = this.getUsageQuota(tier, metric as UsageMetric);
        const percentage = Math.min(100, Math.round((used / limit) * 100));
        const overage = Math.max(0, used - limit);
        const overageCost = this.calculateOverageCost(metric as UsageMetric, overage);
        const projected = Math.round(used * 1.2); // Simple projection
        
        stats.push({
          metric: metric as UsageMetric,
          used,
          limit,
          percentage,
          projected,
          overage,
          overageCost
        });
        
        totalOverageCost += overageCost;
        
        // Generate recommendations
        if (overage > 0) {
          recommendations.push(`Reduce ${metric.toLowerCase()} usage or purchase addon packs`);
        } else if (percentage > 80) {
          recommendations.push(`Consider upgrading your plan to accommodate growth`);
        }
      }
      
      return { stats, totalOverageCost, recommendations };
    } catch (error) {
      logger.error('[PricingPolicyAgent] Failed to generate usage report', {
        err: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

// Export singleton instance
export const pricingPolicyAgent = new PricingPolicyAgent();