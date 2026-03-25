/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  TravelPackage,
  TravelBooking,
  BookingStatus,
  TravelProductType,
  Itinerary
} from '../types';

export interface PackageFilters {
  type?: TravelProductType;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  minDays?: number;
  maxDays?: number;
  difficulty?: 'easy' | 'moderate' | 'challenging';
  isAvailable?: boolean;
}

export interface BookingFilters {
  customerId?: string;
  status?: BookingStatus;
  from?: Date;
  to?: Date;
  packageId?: string;
}

/**
 * TravelBookingService - Manages travel package bookings and itineraries
 */
export class TravelBookingService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Get travel packages with filters
   */
  async getPackages(filters: PackageFilters): Promise<TravelPackage[]> {
    const where: Record<string, unknown> = {};

    if (filters.type) where['type'] = filters.type;
    if (filters.destination) where['destination'] = { contains: filters.destination, mode: 'insensitive' };
    if (filters.isAvailable !== undefined) where['isAvailable'] = filters.isAvailable;
    if (filters.difficulty) where['difficulty'] = filters.difficulty;
    if (filters.minDays || filters.maxDays) {
      where['durationDays'] = {
        ...(filters.minDays ? { gte: filters.minDays } : {}),
        ...(filters.maxDays ? { lte: filters.maxDays } : {}),
      };
    }
    if (filters.minPrice || filters.maxPrice) {
      where['pricePerPerson'] = {
        ...(filters.minPrice ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
      };
    }

    return this.db.travelPackage.findMany({ where, orderBy: { rating: 'desc' } }) as Promise<TravelPackage[]>;
  }

  /**
   * Create a new booking
   */
  async createBooking(data: Omit<TravelBooking, 'id' | 'amountPaid' | 'confirmationCode' | 'createdAt' | 'updatedAt'>): Promise<TravelBooking> {
    const now = new Date();
    const booking: TravelBooking = {
      ...data,
      id: `bkg_${Date.now()}`,
      amountPaid: 0,
      confirmationCode: this.generateConfirmationCode(),
      createdAt: now,
      updatedAt: now,
    };

    await this.db.travelBooking.create({ data: booking });
    return booking;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await this.db.travelBooking.update({
      where: { id: bookingId },
      data: { status, updatedAt: new Date() },
    });
  }

  /**
   * Get bookings with filters
   */
  async getBookings(filters: BookingFilters): Promise<TravelBooking[]> {
    const where: Record<string, unknown> = {};

    if (filters.customerId) where['customerId'] = filters.customerId;
    if (filters.status) where['status'] = filters.status;
    if (filters.packageId) where['packageId'] = filters.packageId;
    if (filters.from || filters.to) {
      where['travelDate'] = {
        ...(filters.from ? { gte: filters.from } : {}),
        ...(filters.to ? { lte: filters.to } : {}),
      };
    }

    return this.db.travelBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }) as Promise<TravelBooking[]>;
  }

  /**
   * Get a single booking by id
   */
  async getBookingById(bookingId: string): Promise<TravelBooking | null> {
    const booking = await this.db.travelBooking.findUnique({
      where: { id: bookingId },
    });
    return (booking as TravelBooking | null) ?? null;
  }

  /**
   * Record a payment for a booking
   */
  async recordPayment(bookingId: string, amount: number): Promise<void> {
    const booking = await this.db.travelBooking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error(`Booking ${bookingId} not found`);

    const newAmountPaid = (booking.amountPaid as number) + amount;
    const newStatus = newAmountPaid >= (booking.totalPrice as number) ? 'confirmed' : 'pending';

    await this.db.travelBooking.update({
      where: { id: bookingId },
      data: { amountPaid: newAmountPaid, status: newStatus, updatedAt: new Date() },
    });
  }

  /**
   * Create or update an itinerary for a package
   */
  async upsertItinerary(data: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>): Promise<Itinerary> {
    const now = new Date();

    const existing = await this.db.itinerary.findFirst({ where: { packageId: data.packageId } });

    if (existing) {
      return this.db.itinerary.update({
        where: { id: existing.id },
        data: { ...data, updatedAt: now },
      }) as Promise<Itinerary>;
    }

    const itinerary: Itinerary = {
      ...data,
      id: `itin_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.itinerary.create({ data: itinerary });
    return itinerary;
  }

  /**
   * Get popular destinations
   */
  async getPopularDestinations(tenantId: string, limit: number = 6): Promise<any[]> {
    return this.db.destination.findMany({
      where: { tenantId, isPopular: true },
      take: limit,
      orderBy: { averageRating: 'desc' },
    }) as Promise<any[]>;
  }

  /**
   * Get analytics
   */
  async getAnalytics(tenantId: string): Promise<any> {
    void tenantId;

    return {
      totalBookings: 0,
      bookingsThisMonth: 0,
      totalRevenue: 0,
      revenueThisMonth: 0,
      revenueGrowth: 0,
      averageBookingValue: 0,
      topDestinations: [],
      bookingsByType: {
        flight: 0,
        hotel: 0,
        tour_package: 0,
        car_rental: 0,
        cruise: 0,
        activity: 0,
        transfer: 0,
        visa_service: 0,
      },
      bookingsByStatus: {
        inquiry: 0,
        pending: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        refunded: 0,
      },
      conversionRate: 0,
      repeatCustomerRate: 0,
    };
  }

  private generateConfirmationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}
