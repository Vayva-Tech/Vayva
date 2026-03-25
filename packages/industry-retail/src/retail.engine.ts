/**
 * Retail Industry Engine
 * Main orchestrator for all retail-specific features
 */

import {
  DashboardEngine,
  type DashboardEngineConfig,
} from '@vayva/industry-core';

import { RETAIL_DASHBOARD_CONFIG } from './dashboard-config';

// Import feature modules
import { ChannelSyncFeature } from './features/channel-sync.feature';
import { CustomerSegmentationFeature } from './features/customer-segmentation.feature';

// Import AI services
import { DemandForecastingService } from './services/demand-forecasting-ai.service';
import { ProductRecommendationService } from './services/product-recommendation.service';
import { DynamicPricingService } from './services/dynamic-pricing.service';

export interface RetailEngineConfig {
  inventory?: boolean;
  loyalty?: boolean;
  multiChannel?: boolean;
  storePerformance?: boolean;
  transfers?: boolean;
  channelSync?: boolean;
  dynamicPricing?: boolean;
  customerSegments?: boolean;
  aiDemandForecasting?: boolean;
  aiProductRecommendation?: boolean;
  aiDynamicPricing?: boolean;
}

export type RetailFeatureId = 
  | 'inventory-management'
  | 'loyalty-programs'
  | 'multi-channel'
  | 'store-performance'
  | 'transfer-workflow'
  | 'channel-sync'
  | 'dynamic-pricing'
  | 'customer-segmentation'
  | 'ai-demand-forecasting'
  | 'ai-product-recommendation'
  | 'ai-dynamic-pricing';

export interface RetailEngineStatus {
  initialized: boolean;
  activeFeatures: RetailFeatureId[];
  dashboardReady: boolean;
  servicesReady: boolean;
}

export class RetailEngine {
  // Dashboard engine
  private dashboardEngine: DashboardEngine;

  // Configuration
  private retailConfig: RetailEngineConfig;

  // Status tracking
  private status: RetailEngineStatus;

  // Feature instances
  private channelSyncFeature?: ChannelSyncFeature;
  private customerSegmentationFeature?: CustomerSegmentationFeature;
  
  // AI Services
  private demandForecastingService: DemandForecastingService | null = null;
  private productRecommendationService: ProductRecommendationService | null = null;
  private dynamicPricingService: DynamicPricingService | null = null;

  constructor(
    config: RetailEngineConfig = {}
  ) {
    this.retailConfig = {
      aiDemandForecasting: false,
      aiProductRecommendation: false,
      aiDynamicPricing: false,
      ...config
    };
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(RETAIL_DASHBOARD_CONFIG);
    
    this.status = {
      initialized: false,
      activeFeatures: [],
      dashboardReady: false,
      servicesReady: false,
    };
  }

  /**
   * Initialize the retail engine and all enabled features
   */
  async initialize(): Promise<void> {
    try {
      // Track active features based on config
      if (this.retailConfig.inventory) {
        this.status.activeFeatures.push('inventory-management');
      }

      if (this.retailConfig.loyalty) {
        this.status.activeFeatures.push('loyalty-programs');
      }

      if (this.retailConfig.multiChannel) {
        this.status.activeFeatures.push('multi-channel');
      }

      if (this.retailConfig.storePerformance) {
        this.status.activeFeatures.push('store-performance');
      }

      if (this.retailConfig.transfers) {
        this.status.activeFeatures.push('transfer-workflow');
      }

      if (this.retailConfig.channelSync) {
        this.status.activeFeatures.push('channel-sync');
      }

      if (this.retailConfig.dynamicPricing) {
        this.status.activeFeatures.push('dynamic-pricing');
      }

      if (this.retailConfig.customerSegments) {
        this.status.activeFeatures.push('customer-segmentation');
      }

      // Initialize Channel Sync feature if enabled
      if (this.retailConfig.channelSync) {
        this.channelSyncFeature = new ChannelSyncFeature();
        await this.channelSyncFeature.initialize();
      }

      // Initialize Customer Segmentation feature if enabled
      if (this.retailConfig.customerSegments) {
        this.customerSegmentationFeature = new CustomerSegmentationFeature();
        await this.customerSegmentationFeature.initialize();
      }

      // Initialize AI services if enabled
      await this.initializeAIServices();

      this.status.servicesReady = true;
      this.status.initialized = true;
      this.status.dashboardReady = true;

      // Register data resolvers for dashboard widgets
      this.registerDataResolvers();

      console.log(`[RETAIL_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
    } catch (error) {
      console.error('[RETAIL_ENGINE] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Initialize AI services based on configuration
   */
  private async initializeAIServices(): Promise<void> {
    if (this.retailConfig.aiDemandForecasting) {
      this.demandForecastingService = new DemandForecastingService();
      await this.demandForecastingService.initialize();
      console.log('[RETAIL_ENGINE] AI Demand Forecasting service initialized');
    }
    
    if (this.retailConfig.aiProductRecommendation) {
      this.productRecommendationService = new ProductRecommendationService();
      await this.productRecommendationService.initialize();
      console.log('[RETAIL_ENGINE] AI Product Recommendation service initialized');
    }
    
    if (this.retailConfig.aiDynamicPricing) {
      this.dynamicPricingService = new DynamicPricingService();
      await this.dynamicPricingService.initialize();
      console.log('[RETAIL_ENGINE] AI Dynamic Pricing service initialized');
    }
  }

  /**
   * Get the dashboard engine for widget configuration
   */
  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  /**
   * Get current engine status
   */
  getStatus(): RetailEngineStatus {
    return { ...this.status };
  }

  /**
   * Get active features
   */
  getActiveFeatures(): RetailFeatureId[] {
    return [...this.status.activeFeatures];
  }
  
  // AI Service Accessors
  
  /**
   * Get Demand Forecasting service
   */
  getDemandForecastingService(): DemandForecastingService | null {
    if (!this.demandForecastingService) {
      console.warn('[RETAIL_ENGINE] AI Demand Forecasting not enabled. Enable aiDemandForecasting in config.');
    }
    return this.demandForecastingService;
  }
  
  /**
   * Get Product Recommendation service
   */
  getProductRecommendationService(): ProductRecommendationService | null {
    if (!this.productRecommendationService) {
      console.warn('[RETAIL_ENGINE] AI Product Recommendation not enabled. Enable aiProductRecommendation in config.');
    }
    return this.productRecommendationService;
  }
  
  /**
   * Get Dynamic Pricing service
   */
  getDynamicPricingService(): DynamicPricingService | null {
    if (!this.dynamicPricingService) {
      console.warn('[RETAIL_ENGINE] AI Dynamic Pricing not enabled. Enable aiDynamicPricing in config.');
    }
    return this.dynamicPricingService;
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

  /**
   * Check if a feature is available (initialized)
   */
  isFeatureAvailable(featureId: RetailFeatureId): boolean {
    return this.status.activeFeatures.includes(featureId);
  }

  /**
   * Get retail-specific feature
   */
  getRetailFeature<T>(featureId: RetailFeatureId): T | undefined {
    return this.getFeature<T>(featureId);
  }

  /**
   * Get a feature service by ID
   */
  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'channel-sync':
        return this.channelSyncFeature as T;
      case 'customer-segmentation':
        return this.customerSegmentationFeature as T;
      default:
        return undefined;
    }
  }

  /**
   * Get Channel Sync feature
   */
  getChannelSync(): ChannelSyncFeature | undefined {
    return this.channelSyncFeature;
  }

  /**
   * Get Customer Segmentation feature
   */
  getCustomerSegmentation(): CustomerSegmentationFeature | undefined {
    return this.customerSegmentationFeature;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featureId: string): boolean {
    switch (featureId) {
      case 'inventory-management':
        return !!this.retailConfig.inventory;
      case 'loyalty-programs':
        return !!this.retailConfig.loyalty;
      case 'multi-channel':
        return !!this.retailConfig.multiChannel;
      case 'store-performance':
        return !!this.retailConfig.storePerformance;
      case 'transfer-workflow':
        return !!this.retailConfig.transfers;
      case 'channel-sync':
        return !!this.retailConfig.channelSync;
      case 'dynamic-pricing':
        return !!this.retailConfig.dynamicPricing;
      case 'customer-segmentation':
        return !!this.retailConfig.customerSegments;
      default:
        return false;
    }
  }

  /**
   * Cleanup and dispose of all resources
   */
  async dispose(): Promise<void> {
    if (this.channelSyncFeature?.dispose) {
      await this.channelSyncFeature.dispose();
    }
    if (this.customerSegmentationFeature?.dispose) {
      await this.customerSegmentationFeature.dispose();
    }
  }
}

export class RetailEngineFactory {
  static create(config?: RetailEngineConfig): RetailEngine {
    return new RetailEngine(config);
  }

  static createDefault(): RetailEngine {
    return new RetailEngine({
      inventory: true,
      loyalty: true,
      multiChannel: true,
      storePerformance: true,
      transfers: true,
    });
  }
}

export function createDefaultRetailConfig(): RetailEngineConfig {
  return {
    inventory: true,
    loyalty: true,
    multiChannel: true,
    storePerformance: true,
    transfers: true,
    channelSync: true,
    customerSegments: true,
  };
}
