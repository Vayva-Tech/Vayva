/**
 * Specialized Industry Engine
 */

import { IndustryEngine, Feature } from '@vayva/industry-core';
import type { SpecializedConfig } from './types';
import { SpecializedServiceManagement } from './services/specialized-service-management.service';
import { SpecializedServiceFeature } from './features/specialized-service.feature';

export class SpecializedEngine extends IndustryEngine<SpecializedConfig> {
  private serviceManagement?: SpecializedServiceManagement;
  private serviceFeature?: SpecializedServiceFeature;

  async initialize(): Promise<void> {
    console.log('[SPECIALIZED] Initializing engine...');
    
    if (this.config.serviceManagement !== false) {
      this.serviceManagement = new SpecializedServiceManagement(this.config.serviceManagement);
      await this.serviceManagement.initialize();
      this.serviceFeature = new SpecializedServiceFeature(this.serviceManagement);
      this.features.set('service-management', this.serviceFeature as unknown as Feature);
    }
    
    console.log('[SPECIALIZED] Engine initialized');
  }

  get serviceManagement(): SpecializedServiceFeature | undefined {
    return this.serviceFeature;
  }
}
