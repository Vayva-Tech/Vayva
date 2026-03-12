/**
 * Grocery Industry Engine
 * Main orchestrator for all grocery-specific features
 */

import { DashboardEngine } from '@vayva/industry-core';

import { FreshnessTrackingService } from './services/freshness-tracking.service.js';
import { DeliveryRouteOptimizerService } from './services/delivery-route-optimizer.service.js';
import { ExpirationAlertsService } from './services/expiration-alerts.service.js';
import { SeasonalPricingService } from './services/seasonal-pricing.service.js';

import { FreshnessTrackingFeature } from './features/freshness-tracking.feature.js';
import { DeliveryOptimizationFeature } from './features/delivery-optimization.feature.js';
import { ExpirationAlertsFeature } from './features/expiration-alerts.feature.js';
import { SeasonalPricingFeature } from './features/seasonal-pricing.feature.js';

export interface GroceryEngineConfig {
  freshnessTracking?: boolean;
  deliveryOptimization?: boolean;
  expirationAlerts?: boolean;
  seasonalPricing?: boolean;
}

export type GroceryFeatureId = 
  | 'freshness-tracking'
  | 'delivery-optimization'
  | 'expiration-alerts'
  | 'seasonal-pricing';

export interface GroceryEngineStatus {
  initialized: boolean;
  activeFeatures: GroceryFeatureId[];
  dashboardReady: boolean;
  servicesReady: boolean;
}

export class GroceryEngine {
  private dashboardEngine: DashboardEngine;
  private config: GroceryEngineConfig;
  private status: GroceryEngineStatus;

  // Services
  private freshnessService?: FreshnessTrackingService;
  private deliveryService?: DeliveryRouteOptimizerService;
  private expirationService?: ExpirationAlertsService;
  private pricingService?: SeasonalPricingService;

  // Features
  private freshnessFeature?: FreshnessTrackingFeature;
  private deliveryFeature?: DeliveryOptimizationFeature;
  private expirationFeature?: ExpirationAlertsFeature;
  private pricingFeature?: SeasonalPricingFeature;

  constructor(config: GroceryEngineConfig = {}) {
    this.config = {
      freshnessTracking: true,
      deliveryOptimization: true,
      expirationAlerts: true,
      seasonalPricing: true,
      ...config,
    };
    
    this.dashboardEngine = new DashboardEngine();
    
    this.status = {
      initialized: false,
      activeFeatures: [],
      dashboardReady: false,
      servicesReady: false,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Freshness Tracking
      if (this.config.freshnessTracking) {
        this.freshnessService = new FreshnessTrackingService();
        await this.freshnessService.initialize();
        
        this.freshnessFeature = new FreshnessTrackingFeature(this.freshnessService);
        await this.freshnessFeature.initialize();
        
        this.status.activeFeatures.push('freshness-tracking');
      }

      // Initialize Delivery Optimization
      if (this.config.deliveryOptimization) {
        this.deliveryService = new DeliveryRouteOptimizerService();
        await this.deliveryService.initialize();
        
        this.deliveryFeature = new DeliveryOptimizationFeature(this.deliveryService);
        await this.deliveryFeature.initialize();
        
        this.status.activeFeatures.push('delivery-optimization');
      }

      // Initialize Expiration Alerts
      if (this.config.expirationAlerts) {
        this.expirationService = new ExpirationAlertsService();
        await this.expirationService.initialize();
        
        this.expirationFeature = new ExpirationAlertsFeature(this.expirationService);
        await this.expirationFeature.initialize();
        
        this.status.activeFeatures.push('expiration-alerts');
      }

      // Initialize Seasonal Pricing
      if (this.config.seasonalPricing) {
        this.pricingService = new SeasonalPricingService();
        await this.pricingService.initialize();
        
        this.pricingFeature = new SeasonalPricingFeature(this.pricingService);
        await this.pricingFeature.initialize();
        
        this.status.activeFeatures.push('seasonal-pricing');
      }

      this.status.servicesReady = true;
      this.status.initialized = true;
      this.status.dashboardReady = true;

      this.registerDataResolvers();

      console.log(`[GROCERY_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
    } catch (error) {
      console.error('[GROCERY_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  getStatus(): GroceryEngineStatus {
    return { ...this.status };
  }

  getActiveFeatures(): GroceryFeatureId[] {
    return [...this.status.activeFeatures];
  }

  isFeatureAvailable(featureId: GroceryFeatureId): boolean {
    return this.status.activeFeatures.includes(featureId);
  }

  /**
   * Get services
   */
  getFreshness(): FreshnessTrackingService | undefined {
    return this.freshnessService;
  }

  getDelivery(): DeliveryRouteOptimizerService | undefined {
    return this.deliveryService;
  }

  getExpiration(): ExpirationAlertsService | undefined {
    return this.expirationService;
  }

  getPricing(): SeasonalPricingService | undefined {
    return this.pricingService;
  }

  /**
   * Get features
   */
  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'freshness-tracking':
        return this.freshnessFeature as T;
      case 'delivery-optimization':
        return this.deliveryFeature as T;
      case 'expiration-alerts':
        return this.expirationFeature as T;
      case 'seasonal-pricing':
        return this.pricingFeature as T;
      default:
        return undefined;
    }
  }

  async dispose(): Promise<void> {
    // Cleanup if needed
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
  }
}

export class GroceryEngineFactory {
  static create(config?: GroceryEngineConfig): GroceryEngine {
    return new GroceryEngine(config);
  }

  static createDefault(): GroceryEngine {
    return new GroceryEngine({
      freshnessTracking: true,
      deliveryOptimization: true,
      expirationAlerts: true,
      seasonalPricing: true,
    });
  }
}

export function createDefaultGroceryConfig(): GroceryEngineConfig {
  return {
    freshnessTracking: true,
    deliveryOptimization: true,
    expirationAlerts: true,
    seasonalPricing: true,
  };
}
