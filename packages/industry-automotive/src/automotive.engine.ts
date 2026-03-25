/**
 * Automotive Industry Engine
 * Main orchestrator for all automotive-specific features
 */

import { DashboardEngine } from '@vayva/industry-core';

import { VehicleGalleryService } from './services/vehicle-gallery.service';
import { TestDriveCoordinatorService } from './services/test-drive-coordinator.service';
import { CRMConnectorService } from './services/crm-connector.service';

import { VehicleShowcaseFeature } from './features/vehicle-showcase.feature';
import { TestDriveCoordinatorFeature } from './features/test-drive-coordinator.feature';
import { CRMIntegrationFeature } from './features/crm-integration.feature';

import { AUTOMOTIVE_DASHBOARD_CONFIG } from './dashboard/index';

export interface AutomotiveEngineConfig {
  vehicleGallery?: boolean;
  testDriveCoordinator?: boolean;
  crmConnector?: boolean;
}

export type AutomotiveFeatureId = 
  | 'vehicle-gallery'
  | 'test-drive-coordinator'
  | 'crm-connector';

export interface AutomotiveEngineStatus {
  initialized: boolean;
  activeFeatures: AutomotiveFeatureId[];
  dashboardReady: boolean;
  servicesReady: boolean;
}

export class AutomotiveEngine {
  private dashboardEngine: DashboardEngine;
  private config: AutomotiveEngineConfig;
  private status: AutomotiveEngineStatus;

  // Services
  private vehicleGalleryService?: VehicleGalleryService;
  private testDriveService?: TestDriveCoordinatorService;
  private crmService?: CRMConnectorService;

  // Features
  private vehicleShowcase?: VehicleShowcaseFeature;
  private testDriveCoordinator?: TestDriveCoordinatorFeature;
  private crmIntegration?: CRMIntegrationFeature;

  constructor(config: AutomotiveEngineConfig = {}) {
    this.config = {
      vehicleGallery: true,
      testDriveCoordinator: true,
      crmConnector: true,
      ...config,
    };
    
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(AUTOMOTIVE_DASHBOARD_CONFIG);
    
    this.status = {
      initialized: false,
      activeFeatures: [],
      dashboardReady: false,
      servicesReady: false,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Vehicle Gallery
      if (this.config.vehicleGallery) {
        this.vehicleGalleryService = new VehicleGalleryService();
        await this.vehicleGalleryService.initialize();
        
        this.vehicleShowcase = new VehicleShowcaseFeature(this.vehicleGalleryService);
        await this.vehicleShowcase.initialize();
        
        this.status.activeFeatures.push('vehicle-gallery');
      }

      // Initialize Test Drive Coordinator
      if (this.config.testDriveCoordinator) {
        this.testDriveService = new TestDriveCoordinatorService();
        await this.testDriveService.initialize();
        
        this.testDriveCoordinator = new TestDriveCoordinatorFeature(this.testDriveService);
        await this.testDriveCoordinator.initialize();
        
        this.status.activeFeatures.push('test-drive-coordinator');
      }

      // Initialize CRM Connector
      if (this.config.crmConnector) {
        this.crmService = new CRMConnectorService();
        await this.crmService.initialize();
        
        this.crmIntegration = new CRMIntegrationFeature(this.crmService);
        await this.crmIntegration.initialize();
        
        this.status.activeFeatures.push('crm-connector');
      }

      this.status.servicesReady = true;
      this.status.initialized = true;
      this.status.dashboardReady = true;

      this.registerDataResolvers();

      console.warn(`[AUTOMOTIVE_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
    } catch (error) {
      console.error('[AUTOMOTIVE_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  getStatus(): AutomotiveEngineStatus {
    return { ...this.status };
  }

  getActiveFeatures(): AutomotiveFeatureId[] {
    return [...this.status.activeFeatures];
  }

  isFeatureAvailable(featureId: AutomotiveFeatureId): boolean {
    return this.status.activeFeatures.includes(featureId);
  }

  /**
   * Get vehicle gallery service
   */
  getVehicleGallery(): VehicleGalleryService | undefined {
    return this.vehicleGalleryService;
  }

  /**
   * Get test drive service
   */
  getTestDrive(): TestDriveCoordinatorService | undefined {
    return this.testDriveService;
  }

  /**
   * Get CRM service
   */
  getCRM(): CRMConnectorService | undefined {
    return this.crmService;
  }

  /**
   * Get a feature service by ID
   */
  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'vehicle-gallery':
        return this.vehicleShowcase as T;
      case 'test-drive-coordinator':
        return this.testDriveCoordinator as T;
      case 'crm-connector':
        return this.crmIntegration as T;
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

export class AutomotiveEngineFactory {
  static create(config?: AutomotiveEngineConfig): AutomotiveEngine {
    return new AutomotiveEngine(config);
  }

  static createDefault(): AutomotiveEngine {
    return new AutomotiveEngine({
      vehicleGallery: true,
      testDriveCoordinator: true,
      crmConnector: true,
    });
  }
}

export function createDefaultAutomotiveConfig(): AutomotiveEngineConfig {
  return {
    vehicleGallery: true,
    testDriveCoordinator: true,
    crmConnector: true,
  };
}
