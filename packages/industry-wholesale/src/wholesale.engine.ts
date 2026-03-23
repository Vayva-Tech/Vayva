// @ts-nocheck
/**
 * Wholesale Industry Engine
 * Main orchestrator for wholesale features
 */

import { DashboardEngine } from '@vayva/industry-core';

import { WholesalePriceTiersService } from './services/wholesale-price-tiers.service';
import { BulkOrderManagerService } from './services/bulk-order-manager.service';
import { InventoryAllocatorService } from './services/inventory-allocator.service';

import { WholesalePriceTiersFeature } from './features/wholesale-price-tiers.feature';
import { BulkOrderManagerFeature } from './features/bulk-order-manager.feature';
import { InventoryAllocatorFeature } from './features/inventory-allocator.feature';

export interface WholesaleEngineConfig {
  priceTiers?: boolean;
  bulkOrders?: boolean;
  inventoryAllocation?: boolean;
}

export type WholesaleFeatureId = 
  | 'price-tiers'
  | 'bulk-orders'
  | 'inventory-allocation';

export class WholesaleEngine {
  private dashboardEngine: DashboardEngine;
  private config: WholesaleEngineConfig;
  
  private priceService?: WholesalePriceTiersService;
  private orderService?: BulkOrderManagerService;
  private inventoryService?: InventoryAllocatorService;

  private priceFeature?: WholesalePriceTiersFeature;
  private orderFeature?: BulkOrderManagerFeature;
  private inventoryFeature?: InventoryAllocatorFeature;

  constructor(config: WholesaleEngineConfig = {}) {
    this.config = {
      priceTiers: true,
      bulkOrders: true,
      inventoryAllocation: true,
      ...config,
    };
    
    this.dashboardEngine = new DashboardEngine();
  }

  async initialize(): Promise<void> {
    try {
      if (this.config.priceTiers) {
        this.priceService = new WholesalePriceTiersService();
        await this.priceService.initialize();
        this.priceFeature = new WholesalePriceTiersFeature(this.priceService);
      }

      if (this.config.bulkOrders) {
        this.orderService = new BulkOrderManagerService();
        await this.orderService.initialize();
        this.orderFeature = new BulkOrderManagerFeature(this.orderService);
      }

      if (this.config.inventoryAllocation) {
        this.inventoryService = new InventoryAllocatorService();
        await this.inventoryService.initialize();
        this.inventoryFeature = new InventoryAllocatorFeature(this.inventoryService);
      }

      this.registerDataResolvers();
      console.log('[WHOLESALE_ENGINE] Initialized successfully');
    } catch (error) {
      console.error('[WHOLESALE_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'price-tiers':
        return this.priceFeature as T;
      case 'bulk-orders':
        return this.orderFeature as T;
      case 'inventory-allocation':
        return this.inventoryFeature as T;
      default:
        return undefined;
    }
  }

  private registerDataResolvers(): void {
    this.dashboardEngine.registerDataResolver('static', {
      resolve: async (config, context) => ({
        widgetId: config.query || 'static',
        data: config.params || {},
        cachedAt: new Date(),
      }),
    });
  }
}

export class WholesaleEngineFactory {
  static create(config?: WholesaleEngineConfig): WholesaleEngine {
    return new WholesaleEngine(config);
  }

  static createDefault(): WholesaleEngine {
    return new WholesaleEngine({
      priceTiers: true,
      bulkOrders: true,
      inventoryAllocation: true,
    });
  }
}

export function createDefaultWholesaleConfig(): WholesaleEngineConfig {
  return {
    priceTiers: true,
    bulkOrders: true,
    inventoryAllocation: true,
  };
}
