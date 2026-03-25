/**
 * Specialized Industry Engine
 */

import { IndustryEngine, Feature } from '@vayva/industry-core';
import type { SpecializedEngineConfig } from './types';
import { SpecializedServiceManagement } from './services/specialized-service-management.service';
import { SpecializedServiceFeature } from './features/specialized-service.feature';

export class SpecializedEngine extends IndustryEngine<SpecializedEngineConfig> {
  private serviceManagementClient?: SpecializedServiceManagement;
  private serviceFeature?: SpecializedServiceFeature;

  async initialize(): Promise<void> {
    console.log('[SPECIALIZED] Initializing engine...');
    
    if (this.config.serviceManagement !== false) {
      this.serviceManagementClient = new SpecializedServiceManagement(this.config.serviceManagement);
      await this.serviceManagementClient.initialize();
      this.serviceFeature = new SpecializedServiceFeature(this.serviceManagementClient);
      this.features.set('service-management', this.serviceFeature as unknown as Feature);
    }
    
    console.log('[SPECIALIZED] Engine initialized');
  }

  get serviceManagement(): SpecializedServiceFeature | undefined {
    return this.serviceFeature;
  }
}
