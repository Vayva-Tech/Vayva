import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Rental Service - Backend
 * Manages rental products, bookings, and returns
 */
export class RentalService {
  constructor(private readonly db = prisma) {}

  /**
   * Create a rental product
   */
  async createRentalProduct(rentalData: any) {
    const { storeId, productId, type, pricing, availability } = rentalData;

    const rental = await this.db.rentalProduct.create({
      data: {
        id: `rental-${Date.now()}`,
        storeId,
        productId,
        type,
        status: 'active',
        dailyRate: pricing.dailyRate || null,
        weeklyRate: pricing.weeklyRate || null,
        monthlyRate: pricing.monthlyRate,
        securityDeposit: pricing.securityDeposit,
        cleaningFee: pricing.cleaningFee || null,
        lateFeePerDay: pricing.lateFeePerDay,
        damageWaiver: pricing.damageWaiver || null,
        leaseTermMonths: pricing.leaseTermMonths || null,
        purchasePrice: pricing.purchasePrice || null,
        discountPurchasePercent: pricing.discountPurchasePercent || null,
        totalQuantity: availability?.totalQuantity || 1,
        availableQuantity: availability?.availableQuantity || 1,
        reservedQuantity: 0,
        rentedQuantity: 0,
        maintenanceQuantity: 0,
      },
    });

    return rental;
  }

  /**
   * Get all rental products for a store
   */
  async getStoreRentals(storeId: string, filters?: { status?: string; type?: string }) {
    const where: any = { storeId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    return await this.db.rentalProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Book a rental
   */
  async bookRental(bookingData: any) {
    const {
      storeId,
      customerId,
      rentalProductId,
      startDate,
      endDate,
      rentalType = 'monthly',
    } = bookingData;

    // Check availability
    const rental = await this.db.rentalProduct.findUnique({
      where: { id: rentalProductId },
    });

    if (!rental || rental.availableQuantity <= 0) {
      throw new Error('Rental product not available');
    }

    // Calculate pricing
    const pricing = await this.calculateRentalPricing(rental, startDate, endDate, rentalType);

    // Create booking
    const booking = await this.db.rentalBooking.create({
      data: {
        id: `booking-${Date.now()}`,
        storeId,
        customerId,
        rentalProductId,
        startDate,
        endDate,
        status: 'confirmed',
        totalAmount: pricing.total,
        securityDeposit: rental.securityDeposit,
        paidAmount: 0,
      },
    });

    // Update availability
    await this.db.rentalProduct.update({
      where: { id: rentalProductId },
      data: {
        availableQuantity: rental.availableQuantity - 1,
        reservedQuantity: (rental.reservedQuantity || 0) + 1,
      },
    });

    return { booking, pricing };
  }

  /**
   * Calculate rental pricing
   */
  private async calculateRentalPricing(rental: any, startDate: Date, endDate: Date, type: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end.getTime() - start.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    let basePrice = 0;

    switch (type) {
      case 'daily':
        basePrice = (rental.dailyRate || 0) * durationDays;
        break;
      case 'weekly':
        const weeks = Math.ceil(durationDays / 7);
        basePrice = (rental.weeklyRate || rental.dailyRate! * 7) * weeks;
        break;
      case 'monthly':
      default:
        const months = Math.ceil(durationDays / 30);
        basePrice = rental.monthlyRate * months;
        break;
    }

    const fees = (rental.cleaningFee || 0) + (rental.damageWaiver || 0);
    const total = basePrice + fees;

    return {
      basePrice,
      fees,
      total,
      durationDays,
    };
  }

  /**
   * Return a rental
   */
  async returnRental(bookingId: string, storeId: string, returnData: any) {
    const { condition, notes } = returnData;

    const booking = await this.db.rentalBooking.findFirst({
      where: { id: bookingId, storeId },
      include: { rentalProduct: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check for damage
    let damageFee = 0;
    if (condition === 'damaged') {
      damageFee = returnData.damageAmount || 0;
    }

    // Calculate late fees
    const now = new Date();
    let lateFee = 0;
    if (now > booking.endDate) {
      const daysLate = Math.ceil((now.getTime() - booking.endDate.getTime()) / (1000 * 60 * 60 * 24));
      lateFee = (booking.rentalProduct.lateFeePerDay || 0) * daysLate;
    }

    // Update booking
    await this.db.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: 'returned',
        returnedAt: now,
        actualReturnDate: now,
        damageFee: damageFee > 0 ? damageFee : null,
        lateFee: lateFee > 0 ? lateFee : null,
        returnNotes: notes || null,
      },
    });

    // Update rental product availability
    await this.db.rentalProduct.update({
      where: { id: booking.rentalProductId },
      data: {
        availableQuantity: booking.rentalProduct.availableQuantity + 1,
        reservedQuantity: booking.rentalProduct.reservedQuantity - 1,
      },
    });

    return {
      bookingId,
      status: 'returned',
      damageFee,
      lateFee,
      totalDue: damageFee + lateFee,
    };
  }

  /**
   * Get active rentals for a customer
   */
  async getCustomerRentals(customerId: string, storeId: string) {
    return await this.db.rentalBooking.findMany({
      where: {
        customerId,
        storeId,
        status: { in: ['confirmed', 'active'] },
      },
      include: {
        rentalProduct: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Extend a rental booking
   */
  async extendRental(bookingId: string, storeId: string, newEndDate: Date) {
    const booking = await this.db.rentalBooking.findFirst({
      where: { id: bookingId, storeId },
      include: { rentalProduct: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Calculate additional cost
    const pricing = await this.calculateRentalPricing(
      booking.rentalProduct,
      booking.endDate,
      newEndDate,
      'monthly'
    );

    // Update booking
    await this.db.rentalBooking.update({
      where: { id: bookingId },
      data: {
        endDate: newEndDate,
        totalAmount: booking.totalAmount + pricing.total,
      },
    });

    return { success: true, additionalCost: pricing.total };
  }
}
