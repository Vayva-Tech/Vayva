/**
 * Food & Beverage Industry Engine
 * Main orchestrator for recipe costing, menu engineering, and kitchen operations
 */

import { DashboardEngine } from '@vayva/industry-core';

import { RecipeCostingService } from './services/recipe-costing.service';
import { MenuEngineeringService } from './services/menu-engineering.service';
import { KitchenDisplayService } from './services/kitchen-display.service';
import { InventoryTrackingService } from './services/inventory-tracking.service';
import { NutritionalAnalysisService } from './services/nutritional-analysis.service';

import { FOOD_DASHBOARD_CONFIG } from './dashboard/food-dashboard.config';

export interface FoodEngineConfig {
  recipeCosting?: boolean;
  menuEngineering?: boolean;
  kitchenOperations?: boolean;
  inventoryTracking?: boolean;
  nutritionalAnalysis?: boolean;
}

export type FoodFeatureId = 
  | 'recipe-costing'
  | 'menu-engineering'
  | 'kitchen-operations'
  | 'inventory-tracking'
  | 'nutritional-analysis';

export class FoodEngine {
  private dashboardEngine: DashboardEngine;
  private config: FoodEngineConfig;
  
  private recipeCosting?: RecipeCostingService;
  private menuEngineering?: MenuEngineeringService;
  private kitchenDisplay?: KitchenDisplayService;
  private inventoryTracking?: InventoryTrackingService;
  private nutritionalAnalysis?: NutritionalAnalysisService;

  constructor(config: FoodEngineConfig = {}) {
    this.config = {
      recipeCosting: true,
      menuEngineering: true,
      kitchenOperations: true,
      inventoryTracking: true,
      nutritionalAnalysis: true,
      ...config,
    };
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(FOOD_DASHBOARD_CONFIG);
  }

  async initialize(): Promise<void> {
    if (this.config.recipeCosting) {
      this.recipeCosting = new RecipeCostingService();
      await this.recipeCosting.initialize();
    }

    if (this.config.menuEngineering) {
      this.menuEngineering = new MenuEngineeringService();
      await this.menuEngineering.initialize();
    }

    if (this.config.kitchenOperations) {
      this.kitchenDisplay = new KitchenDisplayService();
      await this.kitchenDisplay.initialize();
    }

    if (this.config.inventoryTracking) {
      this.inventoryTracking = new InventoryTrackingService();
      await this.inventoryTracking.initialize();
    }

    if (this.config.nutritionalAnalysis) {
      this.nutritionalAnalysis = new NutritionalAnalysisService();
      await this.nutritionalAnalysis.initialize();
    }

    this.registerDataResolvers();
    
    console.log(`[FOOD_ENGINE] Initialized with ${Object.keys(this.config).length} features`);
  }

  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  getService<T>(name: string): T | undefined {
    const services: Record<string, any> = {
      'recipe-costing': this.recipeCosting,
      'menu-engineering': this.menuEngineering,
      'kitchen-display': this.kitchenDisplay,
      'inventory-tracking': this.inventoryTracking,
      'nutritional-analysis': this.nutritionalAnalysis,
    };
    return services[name];
  }

  isFeatureAvailable(featureId: FoodFeatureId): boolean {
    switch (featureId) {
      case 'recipe-costing':
        return !!this.recipeCosting;
      case 'menu-engineering':
        return !!this.menuEngineering;
      case 'kitchen-operations':
        return !!this.kitchenDisplay;
      case 'inventory-tracking':
        return !!this.inventoryTracking;
      case 'nutritional-analysis':
        return !!this.nutritionalAnalysis;
      default:
        return false;
    }
  }

  getStatus(): FoodEngineStatus {
    return {
      initialized: true,
      features: {
        'recipe-costing': this.isFeatureAvailable('recipe-costing'),
        'menu-engineering': this.isFeatureAvailable('menu-engineering'),
        'kitchen-operations': this.isFeatureAvailable('kitchen-operations'),
        'inventory-tracking': this.isFeatureAvailable('inventory-tracking'),
        'nutritional-analysis': this.isFeatureAvailable('nutritional-analysis'),
      },
      timestamp: new Date(),
    };
  }

  async dispose(): Promise<void> {
    // Cleanup resources if needed
    console.log('[FOOD_ENGINE] Disposed');
  }

  private registerDataResolvers(): void {
    this.dashboardEngine.registerDataResolver('static', {
      resolve: async (config, context) => ({
        widgetId: config.query || 'static',
        data: config.params || {},
        cachedAt: new Date(),
      }),
    });

    this.dashboardEngine.registerDataResolver('entity', {
      resolve: async (config, context) => ({
        widgetId: config.entity || 'entity',
        data: {
          entity: config.entity,
          filter: config.filter,
          storeId: context.storeId,
        },
        cachedAt: new Date(),
      }),
    });

    this.dashboardEngine.registerDataResolver('analytics', {
      resolve: async (config, context) => ({
        widgetId: config.query || 'analytics',
        data: {
          query: config.query,
          params: config.params,
          storeId: context.storeId,
        },
        cachedAt: new Date(),
      }),
    });

    this.dashboardEngine.registerDataResolver('realtime', {
      resolve: async (config, context) => ({
        widgetId: config.channel || 'realtime',
        data: {
          channel: config.channel,
          storeId: context.storeId,
        },
        cachedAt: new Date(),
      }),
    });
  }
}

export interface FoodEngineStatus {
  initialized: boolean;
  features: Record<FoodFeatureId, boolean>;
  timestamp: Date;
}

/**
 * Factory for creating FoodEngine instances
 */
export class FoodEngineFactory {
  create(config?: FoodEngineConfig): FoodEngine {
    return new FoodEngine(config);
  }
}

/**
 * Create a default food engine configuration
 */
export function createDefaultFoodConfig(): FoodEngineConfig {
  return {
    recipeCosting: true,
    menuEngineering: true,
    kitchenOperations: true,
    inventoryTracking: true,
    nutritionalAnalysis: true,
  };
}
