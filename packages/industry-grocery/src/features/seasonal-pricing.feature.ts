/**
 * Seasonal Pricing Feature
 * Manages dynamic pricing strategies and promotions
 */

import { SeasonalPricingService, type PricingRule, type PriceCalculation } from '../services/seasonal-pricing.service.js';

export interface SeasonalPricingConfig {
  enableDynamicPricing?: boolean;
}

export class SeasonalPricingFeature {
  private service: SeasonalPricingService;
  private config: SeasonalPricingConfig;

  constructor(
    service: SeasonalPricingService,
    config: SeasonalPricingConfig = {}
  ) {
    this.service = service;
    this.config = {
      enableDynamicPricing: true,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  /**
   * Create pricing rule
   */
  createPricingRule(data: Partial<PricingRule>): PricingRule {
    return this.service.createPricingRule(data);
  }

  /**
   * Calculate price
   */
  calculatePrice(productId: string, basePrice: number, quantity?: number): PriceCalculation {
    return this.service.calculatePrice(productId, basePrice, quantity);
  }

  /**
   * Get active rules
   */
  getActiveRules(productId: string): PricingRule[] {
    return this.service.getActiveRules(productId);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return this.service.getStatistics();
  }
}
