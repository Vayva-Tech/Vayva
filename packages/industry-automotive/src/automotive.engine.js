/**
 * Automotive Industry Engine
 * Main orchestrator for all automotive-specific features
 */

// Main engine - using simplified version since industry-core DashboardEngine has different interface

import { VehicleGalleryService } from './services/vehicle-gallery.service.js';
import { TestDriveCoordinatorService } from './services/test-drive-coordinator.service.js';
import { CRMConnectorService } from './services/crm-connector.service.js';

import { VehicleShowcaseFeature } from './features/vehicle-showcase.feature.js';
import { TestDriveCoordinatorFeature } from './features/test-drive-coordinator.feature.js';
import { CRMIntegrationFeature } from './features/crm-integration.feature.js';

import { AUTOMOTIVE_DASHBOARD_CONFIG } from './dashboard/index.js';

export class AutomotiveEngine {
  constructor(config = {}) {
    this.config = {
      vehicleGallery: true,
      testDriveCoordinator: true,
      crmConnector: true,
      ...config,
    };
    
// Using simplified approach without DashboardEngine
    
    this.status = {
      initialized: false,
      activeFeatures: [],
      dashboardReady: false,
      servicesReady: false,
    };
  }

  async initialize() {
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

      // Using simplified approach without data resolvers

      console.log(`[AUTOMOTIVE_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
    } catch (error) {
      console.error('[AUTOMOTIVE_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  // Simplified dashboard engine getter
  getDashboardEngine() {
    return {
      getConfig: () => AUTOMOTIVE_DASHBOARD_CONFIG,
      setConfig: () => {},
      registerDataResolver: () => {}
    };
  }

  getStatus() {
    return { ...this.status };
  }

  getActiveFeatures() {
    return [...this.status.activeFeatures];
  }

  isFeatureAvailable(featureId) {
    return this.status.activeFeatures.includes(featureId);
  }

  getVehicleGallery() {
    return this.vehicleGalleryService;
  }

  getTestDrive() {
    return this.testDriveService;
  }

  getCRM() {
    return this.crmService;
  }

  getFeature(featureId) {
    switch (featureId) {
      case 'vehicle-gallery':
        return this.vehicleShowcase;
      case 'test-drive-coordinator':
        return this.testDriveCoordinator;
      case 'crm-connector':
        return this.crmIntegration;
      default:
        return undefined;
    }
  }

  // No-op dispose method
  async dispose() {
    // Cleanup if needed
  }
}

export class AutomotiveEngineFactory {
  static create(config) {
    return new AutomotiveEngine(config);
  }

  static createDefault() {
    return new AutomotiveEngine({
      vehicleGallery: true,
      testDriveCoordinator: true,
      crmConnector: true,
    });
  }
}

export function createDefaultAutomotiveConfig() {
  return {
    vehicleGallery: true,
    testDriveCoordinator: true,
    crmConnector: true,
  };
}