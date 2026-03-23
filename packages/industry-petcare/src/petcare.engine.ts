// @ts-nocheck
/**
 * Pet Care Industry Engine
 */

import { IndustryEngine, Feature } from '@vayva/industry-core';
import type { PetCareConfig } from './types';
import { PetHealthRecordsService } from './services/pet-health-records.service';
import { PetHealthRecordsFeature } from './features/pet-health-records.feature';

export class PetCareEngine extends IndustryEngine<PetCareConfig> {
  private healthService?: PetHealthRecordsService;
  private healthFeature?: PetHealthRecordsFeature;

  async initialize(): Promise<void> {
    console.log('[PETCARE] Initializing engine...');
    
    // Initialize health records service
    if (this.config.healthRecords !== false) {
      this.healthService = new PetHealthRecordsService(this.config.healthRecords);
      await this.healthService.initialize();
      this.healthFeature = new PetHealthRecordsFeature(this.healthService);
      this.features.set('health-records', this.healthFeature as unknown as Feature);
    }
    
    console.log('[PETCARE] Engine initialized');
  }

  get healthRecords(): PetHealthRecordsFeature | undefined {
    return this.healthFeature;
  }
}
