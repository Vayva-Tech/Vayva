/**
 * Wellness Industry Engine
 * Main orchestrator for all wellness-specific features
 */

import {
  DashboardEngine,
  type DashboardEngineConfig,
} from '@vayva/industry-core';

import { WELLNESS_DASHBOARD_CONFIG } from './dashboard/index';
import { WellnessBookingService } from './services/booking.service';
import { WellnessPackageService } from './services/package.service';

export interface WellnessEngineConfig {
  roomScheduling?: boolean;
  practitionerManagement?: boolean;
  clientHistory?: boolean;
  treatmentPlanning?: boolean;
  packageManagement?: boolean;
  membershipTracking?: boolean;
}

export type WellnessFeatureId = 
  | 'room-scheduling'
  | 'practitioner-management'
  | 'client-history'
  | 'treatment-planning'
  | 'package-management'
  | 'membership-tracking'
  | 'wellness-portal';

export interface WellnessEngineStatus {
  initialized: boolean;
  activeFeatures: WellnessFeatureId[];
  dashboardReady: boolean;
  servicesReady: boolean;
}

export class WellnessEngine {
  private dashboardEngine: DashboardEngine;
  private config: WellnessEngineConfig;
  private status: WellnessEngineStatus;

  // Service instances
  private bookingService?: WellnessBookingService;
  private packageService?: WellnessPackageService;

  constructor(config: WellnessEngineConfig = {}) {
    this.config = {
      roomScheduling: true,
      practitionerManagement: true,
      clientHistory: true,
      treatmentPlanning: true,
      packageManagement: true,
      membershipTracking: true,
      ...config,
    };
    
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(WELLNESS_DASHBOARD_CONFIG);
    
    this.status = {
      initialized: false,
      activeFeatures: [],
      dashboardReady: false,
      servicesReady: false,
    };
  }

  /**
   * Initialize the wellness engine and all enabled features
   */
  async initialize(): Promise<void> {
    try {
      // Track active features based on config
      if (this.config.roomScheduling) {
        this.status.activeFeatures.push('room-scheduling');
      }

      if (this.config.practitionerManagement) {
        this.status.activeFeatures.push('practitioner-management');
      }

      if (this.config.clientHistory) {
        this.status.activeFeatures.push('client-history');
      }

      if (this.config.treatmentPlanning) {
        this.status.activeFeatures.push('treatment-planning');
      }

      if (this.config.packageManagement) {
        this.status.activeFeatures.push('package-management');
      }

      if (this.config.membershipTracking) {
        this.status.activeFeatures.push('membership-tracking');
      }

      // Initialize services
      // In a real implementation, you'd pass actual DB connection
      const mockDb = {};
      this.bookingService = new WellnessBookingService(mockDb);
      this.packageService = new WellnessPackageService(mockDb);

      this.status.servicesReady = true;
      this.status.initialized = true;
      this.status.dashboardReady = true;

      // Register data resolvers for dashboard widgets
      this.registerDataResolvers();

      console.log(`[WELLNESS_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
    } catch (error) {
      console.error('[WELLNESS_ENGINE] Initialization failed:', error);
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
  getStatus(): WellnessEngineStatus {
    return { ...this.status };
  }

  /**
   * Get active features
   */
  getActiveFeatures(): WellnessFeatureId[] {
    return [...this.status.activeFeatures];
  }

  /**
   * Check if a feature is available
   */
  isFeatureAvailable(featureId: WellnessFeatureId): boolean {
    return this.status.activeFeatures.includes(featureId);
  }

  /**
   * Get wellness service by name
   */
  getService<T>(name: string): T | undefined {
    const services: Record<string, any> = {
      'booking': this.bookingService,
      'package': this.packageService,
    };
    return services[name];
  }

  /**
   * Get booking service
   */
  getBookingService(): WellnessBookingService | undefined {
    return this.bookingService;
  }

  /**
   * Get package service
   */
  getPackageService(): WellnessPackageService | undefined {
    return this.packageService;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featureId: string): boolean {
    switch (featureId) {
      case 'room-scheduling':
        return !!this.config.roomScheduling;
      case 'practitioner-management':
        return !!this.config.practitionerManagement;
      case 'client-history':
        return !!this.config.clientHistory;
      case 'treatment-planning':
        return !!this.config.treatmentPlanning;
      case 'package-management':
        return !!this.config.packageManagement;
      case 'membership-tracking':
        return !!this.config.membershipTracking;
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

export class WellnessEngineFactory {
  static create(config?: WellnessEngineConfig): WellnessEngine {
    return new WellnessEngine(config);
  }

  static createDefault(): WellnessEngine {
    return new WellnessEngine({
      roomScheduling: true,
      practitionerManagement: true,
      clientHistory: true,
      treatmentPlanning: true,
      packageManagement: true,
      membershipTracking: true,
    });
  }
}

export function createDefaultWellnessConfig(): WellnessEngineConfig {
  return {
    roomScheduling: true,
    practitionerManagement: true,
    clientHistory: true,
    treatmentPlanning: true,
    packageManagement: true,
    membershipTracking: true,
  };
}
