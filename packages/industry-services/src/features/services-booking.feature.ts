// @ts-nocheck
/**
 * Services Booking Feature
 */

import { ServicesBookingManagement, ServiceBooking, ServiceProvider, ServicesConfig } from '../services/services-booking-management.service';

export class ServicesBookingFeature {
  constructor(private service: ServicesBookingManagement) {}

  async createBooking(bookingData: Partial<ServiceBooking>): Promise<ServiceBooking> {
    return this.service.createBooking(bookingData);
  }

  async updateStatus(bookingId: string, status: ServiceBooking['status']): Promise<boolean> {
    return this.service.updateStatus(bookingId, status);
  }

  async getUpcomingBookings(daysAhead?: number): Promise<ServiceBooking[]> {
    return this.service.getUpcomingBookings(daysAhead);
  }

  async getAvailableProviders(service?: string): Promise<ServiceProvider[]> {
    return this.service.getAvailableProviders(service);
  }

  async getStatistics() {
    return this.service.getStatistics();
  }
}
