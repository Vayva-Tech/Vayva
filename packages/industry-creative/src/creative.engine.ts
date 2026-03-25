/**
 * Creative Industry Engine
 * Main orchestrator for all creative-specific features
 */

import {
  DashboardEngine,
  type DashboardEngineConfig,
  type DataResolver,
} from '@vayva/industry-core';

import { CREATIVE_DASHBOARD_CONFIG } from './dashboard/index';

export interface CreativeEngineConfig {
  portfolioManagement?: boolean;
  clientProofing?: boolean;
  revisionControl?: boolean;
  projectWorkflow?: boolean;
  assetLibrary?: boolean;
  timeTracking?: boolean;
}

export type CreativeFeatureId = 
  | 'portfolio-management'
  | 'client-proofing'
  | 'revision-control'
  | 'project-workflow'
  | 'asset-library'
  | 'time-tracking'
  | 'collaboration';

export interface CreativeEngineStatus {
  initialized: boolean;
  activeFeatures: CreativeFeatureId[];
  dashboardReady: boolean;
  servicesReady: boolean;
}

export class CreativeEngine {
  // Dashboard engine
  private dashboardEngine: DashboardEngine;

  // Configuration
  private creativeConfig: CreativeEngineConfig;

  // Status tracking
  private status: CreativeEngineStatus;

  constructor(
    config: CreativeEngineConfig = {}
  ) {
    this.creativeConfig = config;
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(CREATIVE_DASHBOARD_CONFIG);
    
    this.status = {
      initialized: false,
      activeFeatures: [],
      dashboardReady: false,
      servicesReady: false,
    };
  }

  /**
   * Initialize the creative engine and all enabled features
   */
  async initialize(): Promise<void> {
    try {
      // Track active features based on config
      if (this.creativeConfig.portfolioManagement) {
        this.status.activeFeatures.push('portfolio-management');
      }

      if (this.creativeConfig.clientProofing) {
        this.status.activeFeatures.push('client-proofing');
      }

      if (this.creativeConfig.revisionControl) {
        this.status.activeFeatures.push('revision-control');
      }

      if (this.creativeConfig.projectWorkflow) {
        this.status.activeFeatures.push('project-workflow');
      }

      if (this.creativeConfig.assetLibrary) {
        this.status.activeFeatures.push('asset-library');
      }

      if (this.creativeConfig.timeTracking) {
        this.status.activeFeatures.push('time-tracking');
      }

      this.status.servicesReady = true;
      this.status.initialized = true;
      this.status.dashboardReady = true;

      // Register data resolvers for dashboard widgets
      this.registerDataResolvers();

      console.log(`[CREATIVE_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
    } catch (error) {
      console.error('[CREATIVE_ENGINE] Initialization failed:', error);
      throw error;
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
  getStatus(): CreativeEngineStatus {
    return { ...this.status };
  }

  /**
   * Get active features
   */
  getActiveFeatures(): CreativeFeatureId[] {
    return [...this.status.activeFeatures];
  }

  /**
   * Check if a feature is available (initialized)
   */
  isFeatureAvailable(featureId: CreativeFeatureId): boolean {
    return this.status.activeFeatures.includes(featureId);
  }

  /**
   * Get creative-specific feature
   */
  getCreativeFeature<T>(featureId: CreativeFeatureId): T | undefined {
    return this.getFeature<T>(featureId);
  }

  /**
   * Get a feature service by ID
   */
  getFeature<T>(featureId: string): T | undefined {
    // Creative doesn't have specific service instances, but this method
    // provides consistency with other industry engines
    return undefined;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featureId: string): boolean {
    switch (featureId) {
      case 'portfolio-management':
        return !!this.creativeConfig.portfolioManagement;
      case 'client-proofing':
        return !!this.creativeConfig.clientProofing;
      case 'revision-control':
        return !!this.creativeConfig.revisionControl;
      case 'project-workflow':
        return !!this.creativeConfig.projectWorkflow;
      case 'asset-library':
        return !!this.creativeConfig.assetLibrary;
      case 'time-tracking':
        return !!this.creativeConfig.timeTracking;
      default:
        return false;
    }
  }

  /**
   * Cleanup and dispose of all resources
   */
  async dispose(): Promise<void> {
    // No explicit cleanup needed
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

export class CreativeEngineFactory {
  static create(config?: CreativeEngineConfig): CreativeEngine {
    return new CreativeEngine(config);
  }

  static createDefault(): CreativeEngine {
    return new CreativeEngine({
      portfolioManagement: true,
      clientProofing: true,
      revisionControl: true,
      projectWorkflow: true,
      assetLibrary: true,
    });
  }
}

export function createDefaultCreativeConfig(): CreativeEngineConfig {
  return {
    portfolioManagement: true,
    clientProofing: true,
    revisionControl: true,
    projectWorkflow: true,
    assetLibrary: true,
  };
}
