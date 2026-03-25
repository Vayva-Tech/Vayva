/**
 * Seasonal Pricing Service
 * Manages dynamic pricing based on seasons, demand, and inventory levels
 */

import { z } from 'zod';

export interface PricingRule {
  id: string;
  productId: string;
  ruleType: 'seasonal' | 'demand-based' | 'clearance' | 'promotional';
  priority: number; // 1-10, higher = more important
  startDate: Date;
  endDate: Date;
  adjustment: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  conditions?: {
    minQuantity?: number;
    maxQuantity?: number;
    dayOfWeek?: number[]; // 0-6
    timeRange?: { start: string; end: string };
  };
  active: boolean;
}

export interface PriceCalculation {
  originalPrice: number;
  adjustedPrice: number;
  discount: number;
  appliedRules: string[];
  validUntil: Date;
}

export interface SeasonalPricingConfig {
  enableDynamicPricing?: boolean;
  maxDiscountPercentage?: number;
  maxMarkupPercentage?: number;
}

const PricingRuleSchema = z.object({
  id: z.string(),
  productId: z.string(),
  ruleType: z.enum(['seasonal', 'demand-based', 'clearance', 'promotional']),
  priority: z.number().min(1).max(10),
  startDate: z.date(),
  endDate: z.date(),
  adjustment: z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number(),
  }),
  conditions: z.object({
    minQuantity: z.number().optional(),
    maxQuantity: z.number().optional(),
    dayOfWeek: z.array(z.number().min(0).max(6)).optional(),
    timeRange: z.object({
      start: z.string(),
      end: z.string(),
    }).optional(),
  }).optional(),
  active: z.boolean(),
});

export class SeasonalPricingService {
  private rules: Map<string, PricingRule>;
  private config: SeasonalPricingConfig;

  constructor(config: SeasonalPricingConfig = {}) {
    this.config = {
      enableDynamicPricing: true,
      maxDiscountPercentage: 50,
      maxMarkupPercentage: 25,
      ...config,
    };
    this.rules = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[SEASONAL_PRICING] Initializing service...');
    console.log('[SEASONAL_PRICING] Service initialized');
  }

  /**
   * Create a pricing rule
   */
  createPricingRule(ruleData: Partial<PricingRule>): PricingRule {
    const rule: PricingRule = {
      ...ruleData,
      id: ruleData.id || `pricing_rule_${Date.now()}`,
      priority: ruleData.priority || 5,
      active: ruleData.active !== undefined ? ruleData.active : true,
    } as PricingRule;

    PricingRuleSchema.parse(rule);
    this.rules.set(rule.id, rule);
    return rule;
  }

  /**
   * Calculate price for a product with all applicable rules
   */
  calculatePrice(productId: string, basePrice: number, quantity: number = 1): PriceCalculation {
    const now = new Date();
    const applicableRules = this.getApplicableRules(productId, now, quantity);

    let adjustedPrice = basePrice;
    const appliedRules: string[] = [];

    // Apply rules in priority order (highest first)
    applicableRules.sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      if (rule.adjustment.type === 'percentage') {
        const adjustment = basePrice * (rule.adjustment.value / 100);
        adjustedPrice += adjustment;
      } else {
        adjustedPrice += rule.adjustment.value;
      }
      appliedRules.push(rule.id);
    }

    // Enforce limits
    const maxPrice = basePrice * (1 + this.config.maxMarkupPercentage! / 100);
    const minPrice = basePrice * (1 - this.config.maxDiscountPercentage! / 100);
    adjustedPrice = Math.max(minPrice, Math.min(maxPrice, adjustedPrice));

    return {
      originalPrice: basePrice,
      adjustedPrice: Math.round(adjustedPrice * 100) / 100,
      discount: Math.round((basePrice - adjustedPrice) * 100) / 100,
      appliedRules,
      validUntil: new Date(now.getTime() + 3600000), // 1 hour
    };
  }

  /**
   * Get active pricing rules for a product
   */
  getActiveRules(productId: string): PricingRule[] {
    const now = new Date();
    return Array.from(this.rules.values()).filter(rule => 
      rule.productId === productId &&
      rule.active &&
      rule.startDate <= now &&
      rule.endDate >= now
    );
  }

  /**
   * Get pricing statistics
   */
  getStatistics(): {
    totalRules: number;
    activeRules: number;
    seasonalRules: number;
    promotionalRules: number;
    clearanceRules: number;
  } {
    const rules = Array.from(this.rules.values());
    
    return {
      totalRules: rules.length,
      activeRules: rules.filter(r => r.active).length,
      seasonalRules: rules.filter(r => r.ruleType === 'seasonal').length,
      promotionalRules: rules.filter(r => r.ruleType === 'promotional').length,
      clearanceRules: rules.filter(r => r.ruleType === 'clearance').length,
    };
  }

  private getApplicableRules(productId: string, now: Date, quantity: number): PricingRule[] {
    return this.getActiveRules(productId).filter(rule => {
      // Check quantity conditions
      if (rule.conditions?.minQuantity && quantity < rule.conditions.minQuantity) {
        return false;
      }
      if (rule.conditions?.maxQuantity && quantity > rule.conditions.maxQuantity) {
        return false;
      }

      // Check day of week
      if (rule.conditions?.dayOfWeek && !rule.conditions.dayOfWeek.includes(now.getDay())) {
        return false;
      }

      // Check time range
      if (rule.conditions?.timeRange) {
        const currentTime = now.toTimeString().slice(0, 5);
        if (currentTime < rule.conditions.timeRange.start || 
            currentTime > rule.conditions.timeRange.end) {
          return false;
        }
      }

      return true;
    });
  }
}
