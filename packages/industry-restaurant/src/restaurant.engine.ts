/**
 * Restaurant Industry Engine
 * Main orchestrator for all restaurant-specific features
 */

import {
  DashboardEngine,
  type DashboardEngineConfig,
  type DataResolver,
} from '@vayva/industry-core';

import {
  KDSService,
  KDSRealtime,
  type KDSConfig,
  type KDSRealtimeConfig,
} from './features/kds/index.js';

import {
  RecipeCostingService,
  MenuEngineeringService,
  type RecipeCostConfig,
  type MenuEngineeringConfig,
} from './features/recipe-costing/index.js';

import {
  EightySixService,
  type EightySixConfig,
} from './features/eighty-six/index.js';

import {
  TableTurnService,
  TableTurnPredictionEngine,
  type TableTurnConfig,
  type PredictionConfig,
} from './features/table-turns/index.js';

import { RESTAURANT_DASHBOARD_CONFIG } from './dashboard/restaurant-dashboard.config.js';
import { LaborForecastingService, type LaborForecastInput } from './services/labor-forecasting.service.js';
import { ReservationNoShowService, type ReservationNoShowInput } from './services/reservation-no-show.service.js';
import { CustomerPreferenceService, type CustomerPreferenceInput } from './services/customer-preference.service.js';

export interface RestaurantEngineConfig {
  kds?: KDSConfig;
  kdsRealtime?: KDSRealtimeConfig;
  recipeCosting?: RecipeCostConfig;
  menuEngineering?: MenuEngineeringConfig;
  eightySix?: EightySixConfig;
  tableTurns?: TableTurnConfig;
  prediction?: PredictionConfig;
  aiLaborForecasting?: boolean;
  aiReservationNoShow?: boolean;
  aiCustomerPreferences?: boolean;
}

export class RestaurantEngine {
  // Feature services
  private kdsService?: KDSService;
  private kdsRealtime?: KDSRealtime;
  private recipeCostingService?: RecipeCostingService;
  private menuEngineeringService?: MenuEngineeringService;
  private eightySixService?: EightySixService;
  private tableTurnService?: TableTurnService;
  private predictionEngine?: TableTurnPredictionEngine;

  // AI Services
  private laborForecastingService: LaborForecastingService | null = null;
  private reservationNoShowService: ReservationNoShowService | null = null;
  private customerPreferenceService: CustomerPreferenceService | null = null;

  // Dashboard engine
  private dashboardEngine: DashboardEngine;

  // Configuration
  private restaurantConfig: RestaurantEngineConfig;

  constructor(
    config: RestaurantEngineConfig = {}
  ) {
    this.restaurantConfig = {
      aiLaborForecasting: false,
      aiReservationNoShow: false,
      aiCustomerPreferences: false,
      ...config
    };
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(RESTAURANT_DASHBOARD_CONFIG);
  }

  /**
   * Initialize the restaurant engine and all enabled features
   */
  async initialize(): Promise<void> {
    // Initialize KDS if enabled
    if (this.restaurantConfig.kds) {
      this.kdsService = new KDSService(this.restaurantConfig.kds);
      await this.kdsService.initialize();

      // Initialize KDS realtime if config provided
      if (this.restaurantConfig.kdsRealtime) {
        this.kdsRealtime = new KDSRealtime(
          this.kdsService,
          this.restaurantConfig.kdsRealtime
        );
        await this.kdsRealtime.initialize();
      }
    }

    // Initialize Recipe Costing if enabled
    if (this.restaurantConfig.recipeCosting) {
      this.recipeCostingService = new RecipeCostingService(
        this.restaurantConfig.recipeCosting
      );
      await this.recipeCostingService.initialize();

      // Initialize Menu Engineering if config provided
      if (this.restaurantConfig.menuEngineering) {
        this.menuEngineeringService = new MenuEngineeringService(
          this.recipeCostingService,
          this.restaurantConfig.menuEngineering
        );
        await this.menuEngineeringService.initialize();
      }
    }

    // Initialize 86 Manager if enabled
    if (this.restaurantConfig.eightySix) {
      this.eightySixService = new EightySixService(this.restaurantConfig.eightySix);
      await this.eightySixService.initialize();
    }

    // Initialize Table Turn Optimization if enabled
    if (this.restaurantConfig.tableTurns) {
      this.tableTurnService = new TableTurnService(this.restaurantConfig.tableTurns);
      await this.tableTurnService.initialize();

      // Initialize Prediction Engine if config provided
      if (this.restaurantConfig.prediction) {
        this.predictionEngine = new TableTurnPredictionEngine(
          this.tableTurnService,
          this.restaurantConfig.prediction
        );
        await this.predictionEngine.initialize();
      }
    }

    // Initialize AI services if enabled
    await this.initializeAIServices();

    // Register data resolvers
    this.registerDataResolvers();
  }
  
  /**
   * Initialize AI services based on configuration
   */
  private async initializeAIServices(): Promise<void> {
    if (this.restaurantConfig.aiLaborForecasting) {
      this.laborForecastingService = new LaborForecastingService();
      await this.laborForecastingService.initialize();
      console.log('[RESTAURANT_ENGINE] AI Labor Forecasting service initialized');
    }
    
    if (this.restaurantConfig.aiReservationNoShow) {
      this.reservationNoShowService = new ReservationNoShowService();
      await this.reservationNoShowService.initialize();
      console.log('[RESTAURANT_ENGINE] AI Reservation No-Show service initialized');
    }
    
    if (this.restaurantConfig.aiCustomerPreferences) {
      this.customerPreferenceService = new CustomerPreferenceService();
      await this.customerPreferenceService.initialize();
      console.log('[RESTAURANT_ENGINE] AI Customer Preferences service initialized');
    }
  }

  /**
   * Get the dashboard configuration
   */
  getDashboardConfig(): DashboardEngineConfig {
    return RESTAURANT_DASHBOARD_CONFIG;
  }

  /**
   * Get KDS service
   */
  getKDS(): KDSService | undefined {
    return this.kdsService;
  }

  /**
   * Get KDS realtime service
   */
  getKDSRealtime(): KDSRealtime | undefined {
    return this.kdsRealtime;
  }

  /**
   * Get Recipe Costing service
   */
  getRecipeCosting(): RecipeCostingService | undefined {
    return this.recipeCostingService;
  }

  /**
   * Get Menu Engineering service
   */
  getMenuEngineering(): MenuEngineeringService | undefined {
    return this.menuEngineeringService;
  }

  /**
   * Get 86 Manager service
   */
  getEightySix(): EightySixService | undefined {
    return this.eightySixService;
  }

  /**
   * Get Table Turn service
   */
  getTableTurns(): TableTurnService | undefined {
    return this.tableTurnService;
  }

  /**
   * Get Prediction Engine
   */
  getPredictionEngine(): TableTurnPredictionEngine | undefined {
    return this.predictionEngine;
  }

  // AI Service Accessors
  
  /**
   * Get Labor Forecasting service
   */
  getLaborForecastingService(): LaborForecastingService | null {
    if (!this.laborForecastingService) {
      console.warn('[RESTAURANT_ENGINE] AI Labor Forecasting not enabled. Enable aiLaborForecasting in config.');
    }
    return this.laborForecastingService;
  }
  
  /**
   * Get Reservation No-Show service
   */
  getReservationNoShowService(): ReservationNoShowService | null {
    if (!this.reservationNoShowService) {
      console.warn('[RESTAURANT_ENGINE] AI Reservation No-Show not enabled. Enable aiReservationNoShow in config.');
    }
    return this.reservationNoShowService;
  }
  
  /**
   * Get Customer Preferences service
   */
  getCustomerPreferenceService(): CustomerPreferenceService | null {
    if (!this.customerPreferenceService) {
      console.warn('[RESTAURANT_ENGINE] AI Customer Preferences not enabled. Enable aiCustomerPreferences in config.');
    }
    return this.customerPreferenceService;
  }

  /**
   * Get restaurant-specific feature
   */
  getRestaurantFeature<T>(featureId: RestaurantFeatureId): T | undefined {
    return this.getFeature<T>(featureId);
  }

  /**
   * Check if a feature is available (initialized)
   */
  isFeatureAvailable(featureId: RestaurantFeatureId | string): boolean {
    switch (featureId) {
      case 'kds':
        return !!this.kdsService;
      case 'kds-realtime':
        return !!this.kdsRealtime;
      case 'recipe-costing':
        return !!this.recipeCostingService;
      case 'menu-engineering':
        return !!this.menuEngineeringService;
      case 'eighty-six':
        return !!this.eightySixService;
      case 'table-turns':
        return !!this.tableTurnService;
      case 'prediction':
        return !!this.predictionEngine;
      case 'ai-labor-forecasting':
        return !!this.laborForecastingService;
      case 'ai-reservation-no-show':
        return !!this.reservationNoShowService;
      case 'ai-customer-preferences':
        return !!this.customerPreferenceService;
      default:
        return false;
    }
  }

  /**
   * Get engine health/status
   */
  getStatus(): RestaurantEngineStatus {
    return {
      initialized: true,
      features: {
        kds: this.isFeatureAvailable('kds'),
        'kds-realtime': this.isFeatureAvailable('kds-realtime'),
        'recipe-costing': this.isFeatureAvailable('recipe-costing'),
        'menu-engineering': this.isFeatureAvailable('menu-engineering'),
        'eighty-six': this.isFeatureAvailable('eighty-six'),
        'table-turns': this.isFeatureAvailable('table-turns'),
        prediction: this.isFeatureAvailable('prediction'),
      },
      timestamp: new Date(),
    };
  }

  /**
   * Cleanup and dispose of all resources
   */
  async dispose(): Promise<void> {
    if (this.kdsRealtime) {
      await this.kdsRealtime.dispose();
    }
    // Cleanup AI services
    this.laborForecastingService = null;
    this.reservationNoShowService = null;
    this.customerPreferenceService = null;
  }

  /**
   * Get a feature service by ID
   */
  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'kds':
        return this.kdsService as T;
      case 'kds-realtime':
        return this.kdsRealtime as T;
      case 'recipe-costing':
        return this.recipeCostingService as T;
      case 'menu-engineering':
        return this.menuEngineeringService as T;
      case 'eighty-six':
        return this.eightySixService as T;
      case 'table-turns':
        return this.tableTurnService as T;
      case 'prediction':
        return this.predictionEngine as T;
      default:
        return undefined;
    }
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featureId: string): boolean {
    switch (featureId) {
      case 'kds':
        return !!this.restaurantConfig.kds;
      case 'kds-realtime':
        return !!this.restaurantConfig.kdsRealtime;
      case 'recipe-costing':
        return !!this.restaurantConfig.recipeCosting;
      case 'menu-engineering':
        return !!this.restaurantConfig.menuEngineering;
      case 'eighty-six':
        return !!this.restaurantConfig.eightySix;
      case 'table-turns':
        return !!this.restaurantConfig.tableTurns;
      case 'prediction':
        return !!this.restaurantConfig.prediction;
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

export type RestaurantFeatureId =
  | 'kds'
  | 'kds-realtime'
  | 'recipe-costing'
  | 'menu-engineering'
  | 'eighty-six'
  | 'table-turns'
  | 'prediction'
  | 'ai-labor-forecasting'
  | 'ai-reservation-no-show'
  | 'ai-customer-preferences';

export interface RestaurantEngineStatus {
  initialized: boolean;
  features: Record<RestaurantFeatureId, boolean>;
  timestamp: Date;
}

/**
 * Factory for creating RestaurantEngine instances
 */
export class RestaurantEngineFactory {
  create(
    config?: RestaurantEngineConfig
  ): RestaurantEngine {
    return new RestaurantEngine(config);
  }
}

/**
 * Create a default restaurant engine configuration
 */
export function createDefaultRestaurantConfig(): RestaurantEngineConfig {
  return {
    kds: {
      pollingInterval: 5000,
      maxOrdersInQueue: 50,
    },
    recipeCosting: {
      enableAutoCalculation: true,
      autoCalculateInterval: 3600000, // 1 hour
    },
    eightySix: {
      enableAutoDetection: true,
      lowStockThreshold: 0,
    },
    tableTurns: {
      enablePredictions: true,
      predictionWindowHours: 24,
    },
  };
}
