/**
 * Travel Booking Feature
 */

import { TravelBookingService, TravelBooking, Itinerary, TravelConfig as _TravelConfig } from '../services/travel-booking.service';

export class TravelBookingFeature {
  constructor(private service: TravelBookingService) {}

  async createBooking(bookingData: Partial<TravelBooking>): Promise<TravelBooking> {
    return this.service.createBooking(bookingData);
  }

  async updateStatus(bookingId: string, status: TravelBooking['status']): Promise<boolean> {
    return this.service.updateStatus(bookingId, status);
  }

  async createItinerary(itineraryData: Partial<Itinerary>): Promise<Itinerary> {
    return this.service.createItinerary(itineraryData);
  }

  async getUpcomingTrips(daysAhead?: number): Promise<Itinerary[]> {
    return this.service.getUpcomingTrips(daysAhead);
  }

  async getStatistics() {
    return this.service.getStatistics();
  }
}
