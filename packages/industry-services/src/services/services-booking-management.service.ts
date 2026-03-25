/**
 * Services Booking Management
 * Manages service appointments, bookings, and provider scheduling
 */

import { z } from 'zod';

export interface ServiceBooking {
  id: string;
  customerId: string;
  serviceId: string;
  serviceName: string;
  providerId?: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  duration: number;
  amount: number;
  deposit?: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
  services: string[];
  rating: number;
  available: boolean;
}

export interface ServicesConfig {
  enableDeposits?: boolean;
  autoConfirm?: boolean;
  enableReminders?: boolean;
}

const ServiceBookingSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  serviceId: z.string(),
  serviceName: z.string(),
  providerId: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']),
  scheduledDate: z.date(),
  duration: z.number().min(15),
  amount: z.number().positive(),
  deposit: z.number().positive().optional(),
});

export class ServicesBookingManagement {
  private bookings: Map<string, ServiceBooking>;
  private providers: Map<string, ServiceProvider>;
  private config: ServicesConfig;

  constructor(config: ServicesConfig = {}) {
    this.config = {
      enableDeposits: false,
      autoConfirm: false,
      enableReminders: true,
      ...config,
    };
    this.bookings = new Map();
    this.providers = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[SERVICES] Initializing service...');
    this.initializeSampleData();
    console.log('[SERVICES] Service initialized');
  }

  private initializeSampleData(): void {
    const sampleProviders: ServiceProvider[] = [
      { id: 'prv1', name: 'Alice Thompson', services: ['Consulting', 'Coaching'], rating: 4.9, available: true },
      { id: 'prv2', name: 'Bob Martinez', services: ['Design', 'Development'], rating: 4.8, available: true },
      { id: 'prv3', name: 'Carol White', services: ['Marketing', 'SEO'], rating: 4.7, available: false },
    ];

    const now = new Date();
    const sampleBookings: ServiceBooking[] = [
      {
        id: 'bk1',
        customerId: 'cust1',
        serviceId: 'svc1',
        serviceName: 'Business Consulting',
        providerId: 'prv1',
        status: 'confirmed',
        scheduledDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        duration: 60,
        amount: 200,
      },
      {
        id: 'bk2',
        customerId: 'cust2',
        serviceId: 'svc2',
        serviceName: 'Web Design',
        providerId: 'prv2',
        status: 'pending',
        scheduledDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        duration: 120,
        amount: 500,
      },
    ];

    sampleProviders.forEach(p => this.providers.set(p.id, p));
    sampleBookings.forEach(b => this.bookings.set(b.id, b));
  }

  createBooking(bookingData: Partial<ServiceBooking>): ServiceBooking {
    const booking: ServiceBooking = {
      ...bookingData,
      id: bookingData.id || `bk_${Date.now()}`,
      status: bookingData.status || (this.config.autoConfirm ? 'confirmed' : 'pending'),
    } as ServiceBooking;

    ServiceBookingSchema.parse(booking);
    this.bookings.set(booking.id, booking);
    return booking;
  }

  updateStatus(bookingId: string, status: ServiceBooking['status']): boolean {
    const booking = this.bookings.get(bookingId);
    if (!booking) return false;
    booking.status = status;
    return true;
  }

  getUpcomingBookings(daysAhead: number = 7): ServiceBooking[] {
    const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return Array.from(this.bookings.values()).filter(
      b => b.scheduledDate <= cutoff && b.scheduledDate >= new Date() && b.status !== 'cancelled'
    );
  }

  getAvailableProviders(service?: string): ServiceProvider[] {
    return Array.from(this.providers.values()).filter(
      p => p.available && (!service || p.services.includes(service))
    );
  }

  getStatistics(): {
    totalBookings: number;
    confirmedBookings: number;
    completionRate: number;
    averageRating: number;
    totalRevenue: number;
  } {
    const all = Array.from(this.bookings.values());
    const completed = all.filter(b => b.status === 'completed');
    const confirmed = all.filter(b => ['confirmed', 'in-progress'].includes(b.status));
    const revenue = completed.reduce((sum, b) => sum + b.amount, 0);
    const avgRating = Array.from(this.providers.values()).reduce((sum, p) => sum + p.rating, 0) / this.providers.size;

    return {
      totalBookings: all.length,
      confirmedBookings: confirmed.length,
      completionRate: all.length > 0 ? (completed.length / all.length) * 100 : 0,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRevenue: Math.round(revenue),
    };
  }
}
