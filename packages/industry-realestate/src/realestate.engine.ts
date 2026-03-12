/**
 * Real Estate Industry Engine
 */

import { IndustryEngine, Feature } from '@vayva/industry-core';
import type { RealEstateConfig } from './types';
import { PropertyManagementService } from './services/property-management.service';
import { PropertyManagementFeature } from './features/property-management.feature';

export class RealEstateEngine extends IndustryEngine<RealEstateConfig> {
  private propertyService?: PropertyManagementService;
  private propertyFeature?: PropertyManagementFeature;

  async initialize(): Promise<void> {
    console.log('[REALESTATE] Initializing engine...');
    
    // Initialize property management service
    if (this.config.propertyManagement !== false) {
      this.propertyService = new PropertyManagementService(this.config.propertyManagement);
      await this.propertyService.initialize();
      this.propertyFeature = new PropertyManagementFeature(this.propertyService);
      this.features.set('property-management', this.propertyFeature as unknown as Feature);
    }
    
    console.log('[REALESTATE] Engine initialized');
  }

  get propertyManagement(): PropertyManagementFeature | undefined {
    return this.propertyFeature;
  }
}
