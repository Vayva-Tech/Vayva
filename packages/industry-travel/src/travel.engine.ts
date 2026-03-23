// @ts-nocheck
/**
 * Travel Industry Engine
 */

import { TravelBookingService, TravelConfig } from './services/travel-booking.service';
import { TravelBookingFeature } from './features/travel-booking.feature';

export class TravelEngine {
  protected config: TravelConfig;
  private bookingService?: TravelBookingService;
  private bookingFeature?: TravelBookingFeature;

  constructor(config: TravelConfig = {}) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('[TRAVEL] Initializing engine...');

    this.bookingService = new TravelBookingService(this.config);
    await this.bookingService.initialize();
    this.bookingFeature = new TravelBookingFeature(this.bookingService);

    console.log('[TRAVEL] Engine initialized');
  }

  get booking(): TravelBookingFeature | undefined {
    return this.bookingFeature;
  }
}
