/**
 * Fashion Industry Engine
 * Main orchestrator for all fashion-specific features
 */

import {
  DashboardEngine,
  type DashboardEngineConfig,
  type DataResolver,
} from '@vayva/industry-core';

import {
  AutoReplenishmentService,
} from './features/auto-replenishment.js';

import {
  DemandForecastService,
} from './features/demand-forecast.js';

import {
  SizeCurveOptimizer,
} from './features/size-curve-optimizer.js';

import {
  WholesaleService,
} from './features/wholesale.js';

import {
  InventoryAlertService,
} from './services/inventory-alerts.service.js';

import {
  TrendAnalysisService,
} from './services/trend-analysis.service.js';

import {
  WholesaleCustomerService,
} from './services/wholesale-customer.service.js';

import {
  CollectionAnalyticsService,
} from './services/collection-analytics.service.js';

import { FASHION_DASHBOARD_CONFIG } from './dashboard-config.js';

export interface FashionEngineConfig {
  autoReplenishment?: boolean;
  demandForecast?: boolean;
  sizeOptimization?: boolean;
  wholesale?: boolean;
  inventoryAlerts?: boolean;
  trendAnalysis?: boolean;
  wholesaleCustomer?: boolean;
  collectionAnalytics?: boolean;
}

export type FashionFeatureId =
  | 'auto-replenishment'
  | 'demand-forecast'
  | 'size-optimization'
  | 'wholesale'
  | 'inventory-alerts'
  | 'trend-analysis'
  | 'wholesale-customer'
  | 'collection-analytics'
  | 'visual-search'
  | 'size-prediction';

export interface FashionEngineStatus {
  initialized: boolean;
  features: Record<FashionFeatureId, boolean>;
  timestamp: Date;
}

export class FashionEngine {
  // Feature services
  private replenishmentService?: AutoReplenishmentService;
  private forecastService?: DemandForecastService;
  private sizeOptimizer?: SizeCurveOptimizer;
  private wholesaleService?: WholesaleService;
  private alertsService?: InventoryAlertService;
  private trendService?: TrendAnalysisService;
  private wholesaleCustomerService?: WholesaleCustomerService;
  private collectionAnalyticsService?: CollectionAnalyticsService;

  // Dashboard engine
  private dashboardEngine: DashboardEngine;

  // Configuration
  private fashionConfig: FashionEngineConfig;

  constructor(
    config: FashionEngineConfig = {}
  ) {
    this.fashionConfig = config;
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(FASHION_DASHBOARD_CONFIG);
  }

  /**
   * Initialize the fashion engine and all enabled features
   */
  async initialize(): Promise<void> {
    // Initialize Auto-Replenishment if enabled
    if (this.fashionConfig.autoReplenishment) {
      this.replenishmentService = new AutoReplenishmentService();
      await this.replenishmentService.initialize?.();
    }

    // Initialize Demand Forecast if enabled
    if (this.fashionConfig.demandForecast) {
      this.forecastService = new DemandForecastService();
      await this.forecastService.initialize?.();
    }

    // Initialize Size Curve Optimizer if enabled
    if (this.fashionConfig.sizeOptimization) {
      this.sizeOptimizer = new SizeCurveOptimizer();
      await this.sizeOptimizer.initialize?.();
    }

    // Initialize Wholesale Service if enabled
    if (this.fashionConfig.wholesale) {
      this.wholesaleService = new WholesaleService();
      await this.wholesaleService.initialize?.();
    }

    // Initialize Inventory Alerts if enabled
    if (this.fashionConfig.inventoryAlerts) {
      this.alertsService = new InventoryAlertService();
      await this.alertsService.initialize?.();
    }

    // Initialize Trend Analysis if enabled
    if (this.fashionConfig.trendAnalysis) {
      this.trendService = new TrendAnalysisService();
      await this.trendService.initialize?.();
    }

    // Initialize Wholesale Customer Service if enabled
    if (this.fashionConfig.wholesaleCustomer) {
      this.wholesaleCustomerService = new WholesaleCustomerService();
      await this.wholesaleCustomerService.initialize?.();
    }

    // Initialize Collection Analytics if enabled
    if (this.fashionConfig.collectionAnalytics) {
      this.collectionAnalyticsService = new CollectionAnalyticsService();
      await this.collectionAnalyticsService.initialize?.();
    }

    // Register data resolvers
    this.registerDataResolvers();
  }

  /**
   * Get the dashboard configuration
   */
  getDashboardConfig(): DashboardEngineConfig {
    return FASHION_DASHBOARD_CONFIG;
  }

  /**
   * Get Auto-Replenishment service
   */
  getAutoReplenishment(): AutoReplenishmentService | undefined {
    return this.replenishmentService;
  }

  /**
   * Get Demand Forecast service
   */
  getDemandForecast(): DemandForecastService | undefined {
    return this.forecastService;
  }

  /**
   * Get Size Curve Optimizer
   */
  getSizeOptimizer(): SizeCurveOptimizer | undefined {
    return this.sizeOptimizer;
  }

  /**
   * Get Wholesale Service
   */
  getWholesale(): WholesaleService | undefined {
    return this.wholesaleService;
  }

  /**
   * Get Inventory Alerts service
   */
  getInventoryAlerts(): InventoryAlertService | undefined {
    return this.alertsService;
  }

  /**
   * Get Trend Analysis service
   */
  getTrendAnalysis(): TrendAnalysisService | undefined {
    return this.trendService;
  }

  /**
   * Get Wholesale Customer Service
   */
  getWholesaleCustomer(): WholesaleCustomerService | undefined {
    return this.wholesaleCustomerService;
  }

  /**
   * Get Collection Analytics Service
   */
  getCollectionAnalytics(): CollectionAnalyticsService | undefined {
    return this.collectionAnalyticsService;
  }

  /**
   * Get fashion-specific feature
   */
  getFashionFeature<T>(featureId: FashionFeatureId): T | undefined {
    return this.getFeature<T>(featureId);
  }

  /**
   * Check if a feature is available (initialized)
   */
  isFeatureAvailable(featureId: FashionFeatureId): boolean {
    switch (featureId) {
      case 'auto-replenishment':
        return !!this.replenishmentService;
      case 'demand-forecast':
        return !!this.forecastService;
      case 'size-optimization':
        return !!this.sizeOptimizer;
      case 'wholesale':
        return !!this.wholesaleService;
      case 'inventory-alerts':
        return !!this.alertsService;
      case 'trend-analysis':
        return !!this.trendService;
      case 'wholesale-customer':
        return !!this.wholesaleCustomerService;
      case 'collection-analytics':
        return !!this.collectionAnalyticsService;
      case 'visual-search':
        return false; // Not implemented yet
      case 'size-prediction':
        return false; // Not implemented yet
      default:
        return false;
    }
  }

  /**
   * Get engine health/status
   */
  getStatus(): FashionEngineStatus {
    return {
      initialized: true,
      features: {
        'auto-replenishment': this.isFeatureAvailable('auto-replenishment'),
        'demand-forecast': this.isFeatureAvailable('demand-forecast'),
        'size-optimization': this.isFeatureAvailable('size-optimization'),
        wholesale: this.isFeatureAvailable('wholesale'),
        'inventory-alerts': this.isFeatureAvailable('inventory-alerts'),
        'trend-analysis': this.isFeatureAvailable('trend-analysis'),
        'wholesale-customer': this.isFeatureAvailable('wholesale-customer'),
        'collection-analytics': this.isFeatureAvailable('collection-analytics'),
        'visual-search': this.isFeatureAvailable('visual-search'),
        'size-prediction': this.isFeatureAvailable('size-prediction'),
      },
      timestamp: new Date(),
    };
  }

  /**
   * Cleanup and dispose of all resources
   */
  async dispose(): Promise<void> {
    // Cleanup services if needed
    if (this.replenishmentService?.dispose) {
      await this.replenishmentService.dispose();
    }
    if (this.forecastService?.dispose) {
      await this.forecastService.dispose();
    }
    if (this.sizeOptimizer?.dispose) {
      await this.sizeOptimizer.dispose();
    }
    if (this.wholesaleService?.dispose) {
      await this.wholesaleService.dispose();
    }
    if (this.alertsService?.dispose) {
      await this.alertsService.dispose();
    }
    if (this.trendService?.dispose) {
      await this.trendService.dispose();
    }
    if (this.wholesaleCustomerService?.dispose) {
      await this.wholesaleCustomerService.dispose();
    }
    if (this.collectionAnalyticsService?.dispose) {
      await this.collectionAnalyticsService.dispose();
    }
  }

  /**
   * Get a feature service by ID
   */
  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'auto-replenishment':
        return this.replenishmentService as T;
      case 'demand-forecast':
        return this.forecastService as T;
      case 'size-optimization':
        return this.sizeOptimizer as T;
      case 'wholesale':
        return this.wholesaleService as T;
      case 'inventory-alerts':
        return this.alertsService as T;
      case 'trend-analysis':
        return this.trendService as T;
      case 'wholesale-customer':
        return this.wholesaleCustomerService as T;
      case 'collection-analytics':
        return this.collectionAnalyticsService as T;
      default:
        return undefined;
    }
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featureId: string): boolean {
    switch (featureId) {
      case 'auto-replenishment':
        return !!this.fashionConfig.autoReplenishment;
      case 'demand-forecast':
        return !!this.fashionConfig.demandForecast;
      case 'size-optimization':
        return !!this.fashionConfig.sizeOptimization;
      case 'wholesale':
        return !!this.fashionConfig.wholesale;
      case 'inventory-alerts':
        return !!this.fashionConfig.inventoryAlerts;
      case 'trend-analysis':
        return !!this.fashionConfig.trendAnalysis;
      case 'wholesale-customer':
        return !!this.fashionConfig.wholesaleCustomer;
      case 'collection-analytics':
        return !!this.fashionConfig.collectionAnalytics;
      default:
        return false;
    }
  }

  /**
   * Get the dashboard engine instance
   */
  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  /**
   * Register data resolvers for dashboard widgets
   */
  private registerDataResolvers(): void {
    // Register static data resolver for simple widgets
    this.dashboardEngine.registerDataResolver('static', {
      resolve: async (config, context) => ({
        widgetId: config.query || 'static',
        data: config.params || {},
        cachedAt: new Date(),
      }),
    });

    // Register entity resolver for database entities
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

    // Register analytics resolver
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

    // Register realtime resolver
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

export class FashionEngineFactory {
  create(
    config?: FashionEngineConfig
  ): FashionEngine {
    return new FashionEngine(config);
  }
}

export function createDefaultFashionConfig(): FashionEngineConfig {
  return {
    autoReplenishment: true,
    demandForecast: true,
    sizeOptimization: true,
    wholesale: true,
    inventoryAlerts: true,
    trendAnalysis: true,
    wholesaleCustomer: true,
    collectionAnalytics: true,
  };
}
