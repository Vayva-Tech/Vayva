/**
 * Travel Booking Service
 * Manages travel reservations, itineraries, and booking workflows
 */

import { z } from 'zod';

export interface TravelBooking {
  id: string;
  customerId: string;
  type: 'flight' | 'hotel' | 'car' | 'package' | 'activity';
  provider: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  startDate: Date;
  endDate?: Date;
  totalAmount: number;
  details: Record<string, any>;
}

export interface Itinerary {
  id: string;
  customerId: string;
  destination: string;
  title: string;
  startDate: Date;
  endDate: Date;
  bookings: TravelBooking[];
  notes?: string;
}

export interface TravelConfig {
  enableMultiCity?: boolean;
  autoConfirm?: boolean;
  enablePackages?: boolean;
}

const TravelBookingSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  type: z.enum(['flight', 'hotel', 'car', 'package', 'activity']),
  provider: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  startDate: z.date(),
  endDate: z.date().optional(),
  totalAmount: z.number().positive(),
  details: z.record(z.any()),
});

export class TravelBookingService {
  private bookings: Map<string, TravelBooking>;
  private itineraries: Map<string, Itinerary>;
  private config: TravelConfig;

  constructor(config: TravelConfig = {}) {
    this.config = {
      enableMultiCity: true,
      autoConfirm: false,
      enablePackages: true,
      ...config,
    };
    this.bookings = new Map();
    this.itineraries = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[TRAVEL_BOOKING] Initializing service...');
    this.initializeSampleData();
    console.log('[TRAVEL_BOOKING] Service initialized');
  }

  private initializeSampleData(): void {
    const sampleBookings: TravelBooking[] = [
      {
        id: 'tb1',
        customerId: 'cust1',
        type: 'flight',
        provider: 'United Airlines',
        status: 'confirmed',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-01'),
        totalAmount: 650,
        details: { flightNumber: 'UA123', from: 'SFO', to: 'JFK', seat: '12A' },
      },
      {
        id: 'tb2',
        customerId: 'cust1',
        type: 'hotel',
        provider: 'Marriott',
        status: 'confirmed',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        totalAmount: 1200,
        details: { roomType: 'Deluxe King', location: 'New York', nights: 4 },
      },
      {
        id: 'tb3',
        customerId: 'cust2',
        type: 'package',
        provider: 'Expedia',
        status: 'pending',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-22'),
        totalAmount: 2500,
        details: { destination: 'Paris', includes: ['flight', 'hotel', 'car'] },
      },
    ];

    sampleBookings.forEach(booking => this.bookings.set(booking.id, booking));
  }

  createBooking(bookingData: Partial<TravelBooking>): TravelBooking {
    const booking: TravelBooking = {
      ...bookingData,
      id: bookingData.id || `tb_${Date.now()}`,
      status: bookingData.status || (this.config.autoConfirm ? 'confirmed' : 'pending'),
    } as TravelBooking;

    TravelBookingSchema.parse(booking);
    this.bookings.set(booking.id, booking);
    return booking;
  }

  updateStatus(bookingId: string, status: TravelBooking['status']): boolean {
    const booking = this.bookings.get(bookingId);
    if (!booking) return false;

    booking.status = status;
    return true;
  }

  getBookingById(bookingId: string): TravelBooking | null {
    const booking = this.bookings.get(bookingId);
    return booking || null;
  }

  createItinerary(itineraryData: Partial<Itinerary>): Itinerary {
    const itinerary: Itinerary = {
      ...itineraryData,
      id: itineraryData.id || `itin_${Date.now()}`,
      bookings: itineraryData.bookings || [],
    };

    this.itineraries.set(itinerary.id, itinerary);
    return itinerary;
  }

  getUpcomingTrips(daysAhead: number = 30): Itinerary[] {
    const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return Array.from(this.itineraries.values()).filter(
      i => i.startDate <= cutoff && i.startDate >= new Date()
    );
  }

  getStatistics(): {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    popularDestinations: string[];
  } {
    const allBookings = Array.from(this.bookings.values());
    const confirmed = allBookings.filter(b => b.status === 'confirmed');
    const pending = allBookings.filter(b => b.status === 'pending');
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.totalAmount, 0);
    const avgValue = confirmed.length > 0 ? totalRevenue / confirmed.length : 0;

    return {
      totalBookings: allBookings.length,
      confirmedBookings: confirmed.length,
      pendingBookings: pending.length,
      totalRevenue: Math.round(totalRevenue),
      averageBookingValue: Math.round(avgValue),
      popularDestinations: ['New York', 'Paris', 'London'],
    };
  }
}
