/**
 * Travel Industry Engine
 */

import { IndustryEngine, Feature } from '@vayva/industry-core';
import type { TravelConfig } from './types';
import { TravelBookingService } from './services/travel-booking.service';
import { TravelBookingFeature } from './features/travel-booking.feature';

export class TravelEngine extends IndustryEngine<TravelConfig> {
  private bookingService?: TravelBookingService;
  private bookingFeature?: TravelBookingFeature;

  async initialize(): Promise<void> {
    console.log('[TRAVEL] Initializing engine...');
    
    if (this.config.booking !== false) {
      this.bookingService = new TravelBookingService(this.config.booking);
      await this.bookingService.initialize();
      this.bookingFeature = new TravelBookingFeature(this.bookingService);
      this.features.set('booking', this.bookingFeature as unknown as Feature);
    }
    
    console.log('[TRAVEL] Engine initialized');
  }

  get booking(): TravelBookingFeature | undefined {
    return this.bookingFeature;
  }
}
