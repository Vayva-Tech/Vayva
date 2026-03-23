// @ts-nocheck
/**
 * Services Industry Engine
 */

import { IndustryEngine, Feature } from '@vayva/industry-core';
import type { ServicesConfig } from './types';
import { ServicesBookingManagement } from './services/services-booking-management.service';
import { ServicesBookingFeature } from './features/services-booking.feature';

export class ServicesEngine extends IndustryEngine<ServicesConfig> {
  private bookingService?: ServicesBookingManagement;
  private bookingFeature?: ServicesBookingFeature;

  async initialize(): Promise<void> {
    console.log('[SERVICES] Initializing engine...');
    
    if (this.config.booking !== false) {
      this.bookingService = new ServicesBookingManagement(this.config.booking);
      await this.bookingService.initialize();
      this.bookingFeature = new ServicesBookingFeature(this.bookingService);
      this.features.set('booking', this.bookingFeature as unknown as Feature);
    }
    
    console.log('[SERVICES] Engine initialized');
  }

  get booking(): ServicesBookingFeature | undefined {
    return this.bookingFeature;
  }
}
