// @ts-nocheck
// ============================================================================
// Pricing Service
// ============================================================================

export interface PricingConfig {
  basePrices: Record<string, number>;
  perMealPrices: Record<string, number>;
  portionMultipliers: Record<number, number>;
  discounts: {
    bulkDiscountThreshold: number;
    bulkDiscountPercent: number;
  };
}

export class PricingService {
  private config: PricingConfig;

  constructor(config?: Partial<PricingConfig>) {
    this.config = {
      basePrices: {
        BASIC: 5000,
        PREMIUM: 8000,
        FAMILY: 12000,
        VEGAN: 7000,
        KETO: 9000,
        LOW_CARB: 8500,
      },
      perMealPrices: {
        BASIC: 2500,
        PREMIUM: 3500,
        FAMILY: 4500,
        VEGAN: 3000,
        KETO: 4000,
        LOW_CARB: 3800,
      },
      portionMultipliers: {
        2: 0.6,
        4: 1.0,
        6: 1.4,
        8: 1.8,
      },
      discounts: {
        bulkDiscountThreshold: 5,
        bulkDiscountPercent: 0.1,
      },
      ...config,
    };
  }

  /**
   * Calculate subscription price
   */
  calculateSubscriptionPrice(options: {
    planType: string;
    portionsPerMeal: number;
    mealsPerWeek: number;
    weeks?: number;
  }): number {
    const { planType, portionsPerMeal, mealsPerWeek, weeks = 1 } = options;

    const basePrice = this.config.basePrices[planType] || this.config.basePrices.BASIC;
    const perMealPrice = this.config.perMealPrices[planType] || this.config.perMealPrices.BASIC;
    const portionMultiplier = this.config.portionMultipliers[portionsPerMeal] || 1.0;

    const weeklyPrice = (basePrice + (perMealPrice * mealsPerWeek)) * portionMultiplier;
    const totalPrice = weeklyPrice * weeks;

    // Apply bulk discount if applicable
    if (weeks >= this.config.discounts.bulkDiscountThreshold) {
      return Math.round(totalPrice * (1 - this.config.discounts.bulkDiscountPercent));
    }

    return Math.round(totalPrice);
  }

  /**
   * Calculate price breakdown
   */
  getPriceBreakdown(options: {
    planType: string;
    portionsPerMeal: number;
    mealsPerWeek: number;
    weeks?: number;
  }): {
    basePrice: number;
    mealPrice: number;
    portionMultiplier: number;
    weeklyTotal: number;
    total: number;
    discount?: number;
  } {
    const { planType, portionsPerMeal, mealsPerWeek, weeks = 1 } = options;

    const basePrice = this.config.basePrices[planType] || this.config.basePrices.BASIC;
    const perMealPrice = this.config.perMealPrices[planType] || this.config.perMealPrices.BASIC;
    const portionMultiplier = this.config.portionMultipliers[portionsPerMeal] || 1.0;

    const weeklyTotal = (basePrice + (perMealPrice * mealsPerWeek)) * portionMultiplier;
    let total = weeklyTotal * weeks;
    let discount: number | undefined;

    if (weeks >= this.config.discounts.bulkDiscountThreshold) {
      discount = total * this.config.discounts.bulkDiscountPercent;
      total -= discount;
    }

    return {
      basePrice,
      mealPrice: perMealPrice * mealsPerWeek,
      portionMultiplier,
      weeklyTotal: Math.round(weeklyTotal),
      total: Math.round(total),
      discount: discount ? Math.round(discount) : undefined,
    };
  }

  /**
   * Compare plans
   */
  comparePlans(planTypes: string[], options: {
    portionsPerMeal: number;
    mealsPerWeek: number;
    weeks?: number;
  }): Record<string, number> {
    const comparison: Record<string, number> = {};

    for (const planType of planTypes) {
      comparison[planType] = this.calculateSubscriptionPrice({
        planType,
        ...options,
      });
    }

    return comparison;
  }

  /**
   * Get pricing configuration
   */
  getConfig(): PricingConfig {
    return { ...this.config };
  }

  /**
   * Update pricing configuration
   */
  updateConfig(newConfig: Partial<PricingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
