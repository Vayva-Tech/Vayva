import type { 
  Availability, 
  PricingRule, 
  DateRange, 
  PriceCalculationResult,
  AvailabilityCheckResult
} from '../types';

export interface SetAvailabilityParams {
  roomId: string;
  dates: DateRange;
  isAvailable: boolean;
  priceOverride?: number;
  minStay?: number;
  maxStay?: number;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
}

export interface PricingContext {
  roomId: string;
  date: Date;
  lengthOfStay: number;
  guests: number;
  propertyId: string;
}

/**
 * AvailabilityService - Manages room availability, pricing, and calendar operations
 */
export class AvailabilityService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Check availability for a room on specific dates
   */
  async checkAvailability(
    roomId: string, 
    dateRange: DateRange
  ): Promise<AvailabilityCheckResult> {
    const { startDate, endDate } = dateRange;
    
    // Get all availability records for the date range
    const availabilityRecords = await this.db.travelAvailability.findMany({
      where: {
        roomId,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    const dateCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if we have records for all dates
    if (availabilityRecords.length < dateCount) {
      return {
        isAvailable: false,
        reason: 'Some dates are not configured'
      };
    }

    // Check if all dates are available
    const unavailableDates = availabilityRecords.filter((record: any) => !record.isAvailable);
    if (unavailableDates.length > 0) {
      return {
        isAvailable: false,
        reason: `Not available on ${unavailableDates[0].date.toDateString()}`
      };
    }

    // Check min/max stay requirements
    for (const record of availabilityRecords) {
      if (record.minStay && dateCount < record.minStay) {
        return {
          isAvailable: false,
          reason: `Minimum stay is ${record.minStay} nights`
        };
      }
      if (record.maxStay && dateCount > record.maxStay) {
        return {
          isAvailable: false,
          reason: `Maximum stay is ${record.maxStay} nights`
        };
      }
    }

    // Check arrival/departure restrictions
    const firstRecord = availabilityRecords[0];
    const lastRecord = availabilityRecords[availabilityRecords.length - 1];
    
    if (firstRecord.closedToArrival) {
      return {
        isAvailable: false,
        reason: 'Closed to arrivals on check-in date'
      };
    }
    
    if (lastRecord.closedToDeparture) {
      return {
        isAvailable: false,
        reason: 'Closed to departures on check-out date'
      };
    }

    // Calculate total price
    const totalPrice = await this.calculatePrice(roomId, dateRange);

    return {
      isAvailable: true,
      price: totalPrice
    };
  }

  /**
   * Set availability for a room on specific dates
   */
  async setAvailability(params: SetAvailabilityParams): Promise<void> {
    const { roomId, dates, isAvailable, priceOverride, minStay, maxStay, closedToArrival, closedToDeparture } = params;
    
    const currentDate = new Date(dates.startDate);
    const endDate = new Date(dates.endDate);

    while (currentDate < endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const date = new Date(dateStr);

      await this.db.travelAvailability.upsert({
        where: {
          roomId_date: {
            roomId,
            date
          }
        },
        update: {
          isAvailable,
          price: priceOverride,
          minStay,
          maxStay,
          closedToArrival,
          closedToDeparture,
          updatedAt: new Date()
        },
        create: {
          roomId,
          date,
          isAvailable,
          price: priceOverride,
          minStay: minStay || 1,
          maxStay,
          closedToArrival: closedToArrival || false,
          closedToDeparture: closedToDeparture || false
        }
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  /**
   * Get price for a room on a specific date
   */
  async getPrice(roomId: string, date: Date): Promise<number> {
    // Check for specific date override
    const availability = await this.db.travelAvailability.findUnique({
      where: {
        roomId_date: {
          roomId,
          date
        }
      }
    });

    if (availability?.price) {
      return Number(availability.price);
    }

    // Get base room price
    const room = await this.db.travelRoom.findUnique({
      where: { id: roomId },
      select: { basePrice: true }
    });

    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    // Apply pricing rules
    const finalPrice = await this.applyPricingRules(
      Number(room.basePrice),
      { roomId, date, lengthOfStay: 1, guests: 1, propertyId: '' }
    );

    return finalPrice;
  }

  /**
   * Calculate total price for a date range
   */
  async calculatePrice(roomId: string, dateRange: DateRange): Promise<number> {
    const { startDate, endDate } = dateRange;
    
    let total = 0;
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    const lengthOfStay = Math.ceil((end.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    while (currentDate < end) {
      const dailyPrice = await this.getPrice(roomId, currentDate);
      total += dailyPrice;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return total;
  }

  /**
   * Apply pricing rules to calculate final price
   */
  private async applyPricingRules(basePrice: number, context: PricingContext): Promise<number> {
    const { roomId, date, lengthOfStay } = context;
    
    // Get room to find propertyId
    const room = await this.db.travelRoom.findUnique({
      where: { id: roomId },
      select: { propertyId: true }
    });

    if (!room) return basePrice;

    // Get active pricing rules for the property
    const pricingRules = await this.db.travelPricingRule.findMany({
      where: {
        propertyId: room.propertyId,
        isActive: true,
        startDate: { lte: date },
        endDate: { gte: date },
        daysOfWeek: { has: date.getDay() }
      }
    });

    let finalPrice = basePrice;

    // Apply rules in order of priority
    for (const rule of pricingRules) {
      switch (rule.strategy) {
        case 'fixed':
          if (rule.fixedPrice) {
            finalPrice = Number(rule.fixedPrice);
          }
          break;
          
        case 'dynamic':
          if (rule.multiplier) {
            finalPrice = finalPrice * Number(rule.multiplier);
          }
          break;
          
        case 'seasonal':
          // Seasonal pricing based on date ranges
          finalPrice = finalPrice * Number(rule.multiplier);
          break;
          
        case 'length_of_stay':
          // Apply discount for longer stays
          if (lengthOfStay >= 7 && rule.multiplier) {
            finalPrice = finalPrice * Number(rule.multiplier);
          }
          break;
          
        case 'group_rate':
          // Could apply group discounts based on guest count
          break;
      }

      // Apply min/max price constraints
      if (rule.minPrice && finalPrice < Number(rule.minPrice)) {
        finalPrice = Number(rule.minPrice);
      }
      if (rule.maxPrice && finalPrice > Number(rule.maxPrice)) {
        finalPrice = Number(rule.maxPrice);
      }
    }

    return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get availability calendar for a room
   */
  async getAvailabilityCalendar(
    roomId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Availability[]> {
    return this.db.travelAvailability.findMany({
      where: {
        roomId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    }) as Promise<Availability[]>;
  }

  /**
   * Block dates for maintenance or other reasons
   */
  async blockDates(
    roomId: string, 
    dates: DateRange, 
    reason?: string
  ): Promise<void> {
    await this.setAvailability({
      roomId,
      dates,
      isAvailable: false
    });

    // Log the blocking reason if needed
    if (reason) {
      console.log(`Blocked dates ${dates.startDate} to ${dates.endDate} for room ${roomId}: ${reason}`);
    }
  }

  /**
   * Open dates for booking
   */
  async openDates(
    roomId: string, 
    dates: DateRange,
    priceOverride?: number
  ): Promise<void> {
    await this.setAvailability({
      roomId,
      dates,
      isAvailable: true,
      priceOverride
    });
  }

  /**
   * Get minimum price for a room over a date range
   */
  async getMinPrice(roomId: string, dateRange: DateRange): Promise<number> {
    const { startDate, endDate } = dateRange;
    
    const availabilityRecords = await this.db.travelAvailability.findMany({
      where: {
        roomId,
        date: {
          gte: startDate,
          lt: endDate
        },
        isAvailable: true
      },
      select: { price: true }
    });

    if (availabilityRecords.length === 0) {
      // Fall back to base room price
      const room = await this.db.travelRoom.findUnique({
        where: { id: roomId },
        select: { basePrice: true }
      });
      return room ? Number(room.basePrice) : 0;
    }

    const prices = availabilityRecords
      .map((record: any) => record.price ? Number(record.price) : null)
      .filter((price: any) => price !== null) as number[];

    if (prices.length === 0) {
      const room = await this.db.travelRoom.findUnique({
        where: { id: roomId },
        select: { basePrice: true }
      });
      return room ? Number(room.basePrice) : 0;
    }

    return Math.min(...prices);
  }

  /**
   * Get detailed price breakdown
   */
  async getPriceBreakdown(
    roomId: string, 
    dateRange: DateRange,
    guests: number = 1
  ): Promise<PriceCalculationResult> {
    const { startDate, endDate } = dateRange;
    
    const basePrice = await this.calculatePrice(roomId, dateRange);
    const lengthOfStay = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const breakdown: Array<{description: string; amount: number; type: 'base' | 'tax' | 'fee' | 'discount'}> = [
      {
        description: 'Accommodation',
        amount: basePrice,
        type: 'base' as const
      }
    ];

    // Add taxes (typically 10-15%)
    const taxRate = 0.12; // 12% tax
    const taxAmount = basePrice * taxRate;
    breakdown.push({
      description: 'Taxes and fees',
      amount: taxAmount,
      type: 'tax' as const
    });

    // Add service fee (typically 5-10%)
    const serviceFeeRate = 0.08; // 8% service fee
    const serviceFee = basePrice * serviceFeeRate;
    breakdown.push({
      description: 'Service fee',
      amount: serviceFee,
      type: 'fee' as const
    });

    const totalPrice = basePrice + taxAmount + serviceFee;

    return {
      basePrice,
      totalPrice,
      breakdown
    };
  }

  /**
   * Bulk update availability for multiple rooms
   */
  async bulkUpdateAvailability(
    updates: Array<{
      roomId: string;
      dates: DateRange;
      isAvailable: boolean;
      priceOverride?: number;
    }>
  ): Promise<void> {
    for (const update of updates) {
      await this.setAvailability({
        roomId: update.roomId,
        dates: update.dates,
        isAvailable: update.isAvailable,
        priceOverride: update.priceOverride
      });
    }
  }

  /**
   * Get availability summary for property management dashboard
   */
  async getAvailabilitySummary(
    propertyId: string, 
    dateRange: DateRange
  ): Promise<{
    totalRooms: number;
    availableRooms: number;
    occupancyRate: number;
    averagePrice: number;
  }> {
    const rooms = await this.db.travelRoom.findMany({
      where: { 
        propertyId,
        isAvailable: true
      },
      include: {
        availability: {
          where: {
            date: {
              gte: dateRange.startDate,
              lt: dateRange.endDate
            }
          }
        }
      }
    });

    const totalRooms = rooms.length;
    let availableRooms = 0;
    let totalPrice = 0;
    let priceCount = 0;

    for (const room of rooms) {
      const availableDates = room.availability.filter((a: any) => a.isAvailable).length;
      const totalDates = Math.ceil(
        (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (availableDates === totalDates) {
        availableRooms++;
        
        // Calculate average price for this room
        const roomPrices = room.availability
          .filter((a: any) => a.price)
          .map((a: any) => Number(a.price));
        
        if (roomPrices.length > 0) {
          const avgRoomPrice = roomPrices.reduce((sum: number, price: number) => sum + price, 0) / roomPrices.length;
          totalPrice += avgRoomPrice;
          priceCount++;
        }
      }
    }

    const occupancyRate = totalRooms > 0 ? (availableRooms / totalRooms) * 100 : 0;
    const averagePrice = priceCount > 0 ? totalPrice / priceCount : 0;

    return {
      totalRooms,
      availableRooms,
      occupancyRate,
      averagePrice
    };
  }
}