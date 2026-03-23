// @ts-nocheck
/**
 * Wholesale Price Tiers Feature
 */

import { WholesalePriceTiersService } from '../services/wholesale-price-tiers.service.js';

export class WholesalePriceTiersFeature {
  constructor(private service: WholesalePriceTiersService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  calculatePrice(productId: string, quantity: number, customerType?: string) {
    return this.service.calculateTieredPrice(productId, quantity, customerType);
  }

  getAvailableTiers(productId: string) {
    return this.service.getAvailableTiers(productId);
  }
}
