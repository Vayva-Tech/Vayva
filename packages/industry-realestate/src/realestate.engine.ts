/**
 * Real Estate Industry Engine
 */

import type { RealEstateConfig } from './types';
import { PropertyManagementService } from './services/property-management.service';
import { PropertyManagementFeature } from './features/property-management.feature';

export class RealEstateEngine {
  private readonly config: RealEstateConfig;
  private propertyService?: PropertyManagementService;
  private propertyFeature?: PropertyManagementFeature;

  constructor(config: RealEstateConfig = {}) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('[REALESTATE] Initializing engine...');

    if (this.config.propertyManagement !== false) {
      const pmConfig =
        this.config.propertyManagement &&
        typeof this.config.propertyManagement === 'object'
          ? this.config.propertyManagement
          : {};
      this.propertyService = new PropertyManagementService(pmConfig);
      await this.propertyService.initialize();
      this.propertyFeature = new PropertyManagementFeature(this.propertyService);
    }

    console.log('[REALESTATE] Engine initialized');
  }

  get propertyManagement(): PropertyManagementFeature | undefined {
    return this.propertyFeature;
  }
}
