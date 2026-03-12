import { prisma } from "@vayva/db";

export interface RentalProduct {
  id: string;
  storeId: string;
  productId: string;
  type: "rental" | "lease_to_own" | "rent_to_own";
  status: "active" | "inactive" | "maintenance" | "retired";
  pricing: {
    dailyRate?: number;
    weeklyRate?: number;
    monthlyRate: number;
    securityDeposit: number;
    cleaningFee?: number;
    lateFeePerDay: number;
    damageWaiver?: number; // insurance/opt-in
    leaseTermMonths?: number; // for lease-to-own
    purchasePrice?: number; // for rent/lease-to-own
    discountPurchasePercent?: number;
  };
  availability: {
    totalQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    rentedQuantity: number;
    maintenanceQuantity: number;
  };
  bookingSettings: {
    minRentalDays: number;
    maxRentalDays?: number;
    advanceBookingDays: number;
    allowInstantBook: boolean;
    requireIdVerification: boolean;
    requireSecurityDeposit: boolean;
    gracePeriodHours: number; // before late fees apply
  };
  condition: {
    current: "new" | "excellent" | "good" | "fair" | "poor";
    purchaseCondition: "new" | "like_new" | "good" | "fair";
    lastInspection?: Date;
    nextInspectionDue?: Date;
  };
  maintenanceSchedule?: {
    frequency: "after_each" | "weekly" | "monthly" | "hours_used";
    hoursThreshold?: number;
    lastMaintenance?: Date;
  };
  location?: {
    pickupAddress: string;
    pickupInstructions?: string;
    allowDelivery: boolean;
    deliveryFee?: number;
    deliveryRadiusKm?: number;
  };
  terms: {
    cancellationPolicy: "flexible" | "moderate" | "strict";
    damagePolicy: string;
    lateReturnPolicy: string;
    prohibitedUses: string[];
    includedAccessories?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RentalBooking {
  id: string;
  rentalProductId: string;
  customerId: string;
  status: "pending" | "confirmed" | "picked_up" | "active" | "returned" | "completed" | "cancelled" | "overdue";
  type: "rental" | "lease_to_own" | "rent_to_own";
  dates: {
    startDate: Date;
    endDate: Date;
    actualPickup?: Date;
    actualReturn?: Date;
    extendedUntil?: Date;
  };
  pricing: {
    baseRate: number; // per period
    periods: number; // days/weeks/months
    subtotal: number;
    securityDeposit: number;
    cleaningFee?: number;
    damageWaiver?: number;
    deliveryFee?: number;
    lateFees: number;
    damageCharges: number;
    total: number;
    discount?: number;
  };
  payments: Array<{
    type: "security_deposit" | "rental_charge" | "extension" | "late_fee" | "damage_charge" | "purchase";
    amount: number;
    status: "pending" | "paid" | "refunded" | "forfeited";
    dueDate?: Date;
    paidAt?: Date;
  }>;
  securityDeposit: {
    amount: number;
    status: "held" | "refunded" | "partially_refunded" | "forfeited";
    refundAmount?: number;
    deductionReason?: string;
    refundedAt?: Date;
  };
  pickup: {
    method: "self" | "delivery";
    address?: string;
    scheduledTime?: Date;
    instructions?: string;
  };
  return: {
    method: "self" | "pickup";
    address?: string;
    scheduledTime?: Date;
    condition?: "excellent" | "good" | "fair" | "damaged";
    damageReport?: {
      description: string;
      photos: string[];
      repairCost?: number;
    };
  };
  extensions: Array<{
    originalEndDate: Date;
    newEndDate: Date;
    additionalCost: number;
    requestedAt: Date;
    approvedAt?: Date;
  }>;
  purchaseOption?: {
    eligible: boolean;
    purchasePrice: number;
    creditsApplied: number; // rental payments applied to purchase
    deadline: Date;
    exercisedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RentalInventory {
  rentalProductId: string;
  serialNumber: string;
  status: "available" | "rented" | "reserved" | "maintenance" | "retired";
  currentBookingId?: string;
  condition: RentalProduct["condition"]["current"];
  totalRentals: number;
  totalRevenue: number;
  maintenanceHistory: Array<{
    date: Date;
    type: "routine" | "repair" | "cleaning" | "inspection";
    description: string;
    cost: number;
    performedBy: string;
  }>;
  purchaseDate?: Date;
  purchasePrice?: number;
  expectedLifespanMonths?: number;
}

export class RentalService {
  private readonly DEFAULT_GRACE_PERIOD_HOURS = 2;

  /**
   * Convert a product to a rental product
   */
  async createRentalProduct(
    storeId: string,
    data: {
      productId: string;
      type: RentalProduct["type"];
      pricing: RentalProduct["pricing"];
      quantity: number;
      bookingSettings?: Partial<RentalProduct["bookingSettings"]>;
      location?: RentalProduct["location"];
      terms?: Partial<RentalProduct["terms"]>;
    }
  ): Promise<RentalProduct> {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) throw new Error("Product not found");
    if (product.storeId !== storeId) throw new Error("Product does not belong to store");

    const rentalProduct = await prisma.rentalProduct.create({
      data: {
        storeId,
        productId: data.productId,
        type: data.type,
        status: "active",
        pricing: data.pricing,
        availability: {
          totalQuantity: data.quantity,
          availableQuantity: data.quantity,
          reservedQuantity: 0,
          rentedQuantity: 0,
          maintenanceQuantity: 0,
        },
        bookingSettings: {
          minRentalDays: data.type === "rental" ? 1 : 30,
          advanceBookingDays: 30,
          allowInstantBook: true,
          requireIdVerification: true,
          requireSecurityDeposit: true,
          gracePeriodHours: this.DEFAULT_GRACE_PERIOD_HOURS,
          ...data.bookingSettings,
        },
        condition: {
          current: "new",
          purchaseCondition: "new",
        },
        location: data.location,
        terms: {
          cancellationPolicy: "moderate",
          damagePolicy: "Renter is responsible for damage beyond normal wear and tear",
          lateReturnPolicy: "Late returns incur daily late fees",
          prohibitedUses: [],
          ...data.terms,
        },
      },
    });

    // Create inventory items
    const inventoryItems: RentalInventory[] = [];
    for (let i = 0; i < data.quantity; i++) {
      inventoryItems.push({
        rentalProductId: rentalProduct.id,
        serialNumber: `SN-${Date.now()}-${i}`,
        status: "available",
        condition: "new",
        totalRentals: 0,
        totalRevenue: 0,
        maintenanceHistory: [],
      });
    }

    await prisma.rentalInventory.createMany({
      data: inventoryItems as unknown as Record<string, unknown>[],
    });

    return this.mapRentalProduct(rentalProduct);
  }

  /**
   * Check availability for date range
   */
  async checkAvailability(
    rentalProductId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    available: boolean;
    availableQuantity: number;
    conflictingBookings: Array<{
      startDate: Date;
      endDate: Date;
      quantity: number;
    }>;
    pricing: {
      dailyRate?: number;
      totalDays: number;
      baseCost: number;
      securityDeposit: number;
    };
  }> {
    const rentalProduct = await prisma.rentalProduct.findUnique({
      where: { id: rentalProductId },
    });

    if (!rentalProduct) throw new Error("Rental product not found");

    // Find conflicting bookings
    const conflictingBookings = await prisma.rentalBooking.findMany({
      where: {
        rentalProductId,
        status: { in: ["confirmed", "picked_up", "active"] },
        OR: [
          {
            // Booking starts during requested period
            dates: {
              path: ["startDate"],
              gte: startDate,
              lte: endDate,
            },
          },
          {
            // Booking ends during requested period
            dates: {
              path: ["endDate"],
              gte: startDate,
              lte: endDate,
            },
          },
          {
            // Booking covers entire requested period
            AND: [
              { dates: { path: ["startDate"], lte: startDate } },
              { dates: { path: ["endDate"], gte: endDate } },
            ],
          },
        ],
      },
    });

    const availability = rentalProduct.availability as RentalProduct["availability"];
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate used quantity
    const usedQuantity = conflictingBookings.length;
    const availableQuantity = availability.totalQuantity - usedQuantity;

    // Calculate pricing
    const pricing = rentalProduct.pricing as RentalProduct["pricing"];
    let baseCost = 0;

    if (pricing.dailyRate && totalDays < 7) {
      baseCost = pricing.dailyRate * totalDays;
    } else if (pricing.weeklyRate && totalDays < 30) {
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      baseCost = pricing.weeklyRate * weeks + (pricing.dailyRate || 0) * remainingDays;
    } else {
      const months = Math.ceil(totalDays / 30);
      baseCost = pricing.monthlyRate * months;
    }

    return {
      available: availableQuantity > 0,
      availableQuantity,
      conflictingBookings: conflictingBookings.map((b) => ({
        startDate: (b.dates as { startDate: Date }).startDate,
        endDate: (b.dates as { endDate: Date }).endDate,
        quantity: 1,
      })),
      pricing: {
        dailyRate: pricing.dailyRate,
        totalDays,
        baseCost,
        securityDeposit: pricing.securityDeposit,
      },
    };
  }

  /**
   * Create a rental booking
   */
  async createBooking(
    rentalProductId: string,
    customerId: string,
    data: {
      startDate: Date;
      endDate: Date;
      type: RentalBooking["type"];
      pickup?: RentalBooking["pickup"];
      deliveryAddress?: string;
      addDamageWaiver?: boolean;
      notes?: string;
    }
  ): Promise<RentalBooking> {
    // Check availability
    const availability = await this.checkAvailability(
      rentalProductId,
      data.startDate,
      data.endDate
    );

    if (!availability.available) {
      throw new Error("Item is not available for the selected dates");
    }

    const rentalProduct = await prisma.rentalProduct.findUnique({
      where: { id: rentalProductId },
    });

    if (!rentalProduct) throw new Error("Rental product not found");

    const pricing = rentalProduct.pricing as RentalProduct["pricing"];
    const totalDays = availability.pricing.totalDays;

    // Calculate costs
    const periods = Math.max(1, Math.ceil(totalDays / 30)); // Monthly periods
    const subtotal = availability.pricing.baseCost;
    const damageWaiver = data.addDamageWaiver ? pricing.damageWaiver || 0 : 0;
    const deliveryFee = data.deliveryAddress && pricing.dailyRate
      ? (rentalProduct.location as { deliveryFee?: number })?.deliveryFee || 0
      : 0;

    const total = subtotal + pricing.securityDeposit + damageWaiver + deliveryFee;

    // Find available inventory item
    const inventory = await prisma.rentalInventory.findFirst({
      where: {
        rentalProductId,
        status: "available",
      },
    });

    if (!inventory) throw new Error("No inventory available");

    // Create booking
    const booking = await prisma.rentalBooking.create({
      data: {
        rentalProductId,
        customerId,
        status: rentalProduct.bookingSettings.allowInstantBook ? "confirmed" : "pending",
        type: data.type,
        dates: {
          startDate: data.startDate,
          endDate: data.endDate,
        },
        pricing: {
          baseRate: pricing.monthlyRate,
          periods,
          subtotal,
          securityDeposit: pricing.securityDeposit,
          cleaningFee: pricing.cleaningFee,
          damageWaiver,
          deliveryFee,
          lateFees: 0,
          damageCharges: 0,
          total,
        },
        payments: [
          {
            type: "security_deposit",
            amount: pricing.securityDeposit,
            status: "pending",
            dueDate: data.startDate,
          },
          {
            type: "rental_charge",
            amount: subtotal + damageWaiver + deliveryFee,
            status: "pending",
            dueDate: data.startDate,
          },
        ],
        securityDeposit: {
          amount: pricing.securityDeposit,
          status: "held",
        },
        pickup: data.pickup || {
          method: "self",
        },
        return: {
          method: "self",
        },
        extensions: [],
        notes: data.notes,
      },
    });

    // Reserve inventory
    await prisma.rentalInventory.update({
      where: { id: inventory.id },
      data: {
        status: "reserved",
        currentBookingId: booking.id,
      },
    });

    // Update availability
    const currentAvailability = rentalProduct.availability as RentalProduct["availability"];
    await prisma.rentalProduct.update({
      where: { id: rentalProductId },
      data: {
        availability: {
          ...currentAvailability,
          availableQuantity: currentAvailability.availableQuantity - 1,
          reservedQuantity: currentAvailability.reservedQuantity + 1,
        },
      },
    });

    // For rent-to-own, set up purchase option
    if (data.type === "rent_to_own") {
      const creditsApplied = Math.floor(subtotal * 0.5); // 50% of rental goes to purchase
      await prisma.rentalBooking.update({
        where: { id: booking.id },
        data: {
          purchaseOption: {
            eligible: true,
            purchasePrice: (pricing.purchasePrice || 0) - creditsApplied,
            creditsApplied,
            deadline: new Date(data.endDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after rental
          },
        },
      });
    }

    return this.mapRentalBooking(booking);
  }

  /**
   * Process pickup
   */
  async processPickup(bookingId: string, actualCondition?: string): Promise<RentalBooking> {
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: { rentalProduct: true },
    });

    if (!booking) throw new Error("Booking not found");

    // Update booking status
    const updated = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: "picked_up",
        dates: {
          ...(booking.dates as Record<string, unknown>),
          actualPickup: new Date(),
        },
      },
    });

    // Update inventory
    await prisma.rentalInventory.updateMany({
      where: { currentBookingId: bookingId },
      data: { status: "rented" },
    });

    // Update availability
    const rentalProduct = booking.rentalProduct as RentalProduct;
    const availability = rentalProduct.availability;
    await prisma.rentalProduct.update({
      where: { id: rentalProduct.id },
      data: {
        availability: {
          ...availability,
          reservedQuantity: availability.reservedQuantity - 1,
          rentedQuantity: availability.rentedQuantity + 1,
        },
      },
    });

    return this.mapRentalBooking(updated);
  }

  /**
   * Process return
   */
  async processReturn(
    bookingId: string,
    data: {
      condition: RentalBooking["return"]["condition"];
      damageReport?: RentalBooking["return"]["damageReport"];
      lateHours?: number;
    }
  ): Promise<RentalBooking> {
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: { rentalProduct: true },
    });

    if (!booking) throw new Error("Booking not found");

    const rentalProduct = booking.rentalProduct as RentalProduct;
    const pricing = rentalProduct.pricing as RentalProduct["pricing"];

    let lateFees = 0;
    let damageCharges = 0;

    // Calculate late fees
    if (data.lateHours && data.lateHours > rentalProduct.bookingSettings.gracePeriodHours) {
      const lateDays = Math.ceil(
        (data.lateHours - rentalProduct.bookingSettings.gracePeriodHours) / 24
      );
      lateFees = lateDays * pricing.lateFeePerDay;
    }

    // Calculate damage charges
    if (data.damageReport?.repairCost) {
      damageCharges = data.damageReport.repairCost;
    }

    // Update booking
    const updated = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: damageCharges > 0 ? "returned" : "completed",
        dates: {
          ...(booking.dates as Record<string, unknown>),
          actualReturn: new Date(),
        },
        return: {
          method: "self",
          condition: data.condition,
          damageReport: data.damageReport,
        },
        pricing: {
          ...(booking.pricing as Record<string, unknown>),
          lateFees,
          damageCharges,
        },
      },
    });

    // Process security deposit
    const securityDeposit = (booking.securityDeposit as { amount: number }).amount;
    const refundAmount = Math.max(0, securityDeposit - lateFees - damageCharges);

    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        securityDeposit: {
          amount: securityDeposit,
          status: refundAmount < securityDeposit ? "partially_refunded" : "refunded",
          refundAmount,
          deductionReason: lateFees > 0 || damageCharges > 0 ? "Late fees and/or damage" : undefined,
          refundedAt: new Date(),
        },
      },
    });

    // Update inventory
    const newCondition = this.mapReturnCondition(data.condition);
    await prisma.rentalInventory.updateMany({
      where: { currentBookingId: bookingId },
      data: {
        status: data.condition === "damaged" ? "maintenance" : "available",
        condition: newCondition,
        currentBookingId: null,
      },
    });

    // Update availability
    const availability = rentalProduct.availability;
    await prisma.rentalProduct.update({
      where: { id: rentalProduct.id },
      data: {
        availability: {
          ...availability,
          availableQuantity: availability.availableQuantity + 1,
          rentedQuantity: availability.rentedQuantity - 1,
          maintenanceQuantity: data.condition === "damaged" 
            ? availability.maintenanceQuantity + 1 
            : availability.maintenanceQuantity,
        },
      },
    });

    // Add to inventory history
    const inventory = await prisma.rentalInventory.findFirst({
      where: { rentalProductId: rentalProduct.id },
      orderBy: { totalRentals: "desc" },
    });

    if (inventory) {
      const history = inventory.maintenanceHistory as RentalInventory["maintenanceHistory"];
      history.push({
        date: new Date(),
        type: data.condition === "damaged" ? "repair" : "inspection",
        description: data.damageReport?.description || `Returned in ${data.condition} condition`,
        cost: damageCharges,
        performedBy: "system",
      });

      await prisma.rentalInventory.update({
        where: { id: inventory.id },
        data: {
          totalRentals: inventory.totalRentals + 1,
          totalRevenue: inventory.totalRevenue + (booking.pricing as { subtotal: number }).subtotal,
          maintenanceHistory: history,
        },
      });
    }

    return this.mapRentalBooking(updated);
  }

  /**
   * Exercise purchase option (rent-to-own)
   */
  async exercisePurchaseOption(bookingId: string, paymentMethod: string): Promise<RentalBooking> {
    const booking = await prisma.rentalBooking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");

    const purchaseOption = booking.purchaseOption as RentalBooking["purchaseOption"];
    if (!purchaseOption?.eligible) {
      throw new Error("Purchase option is not available for this booking");
    }

    const now = new Date();
    if (now > purchaseOption.deadline) {
      throw new Error("Purchase option has expired");
    }

    // Process purchase payment
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        payments: {
          push: {
            type: "purchase",
            amount: purchaseOption.purchasePrice,
            status: "paid",
            paidAt: now,
          },
        },
        purchaseOption: {
          ...purchaseOption,
          exercisedAt: now,
        },
        status: "completed",
      },
    });

    // Transfer ownership to customer (mark inventory as retired/sold)
    await prisma.rentalInventory.updateMany({
      where: { currentBookingId: bookingId },
      data: { status: "retired" },
    });

    const updated = await prisma.rentalBooking.findUnique({ where: { id: bookingId } });
    return this.mapRentalBooking(updated!);
  }

  /**
   * Extend rental period
   */
  async extendRental(
    bookingId: string,
    newEndDate: Date
  ): Promise<{ booking: RentalBooking; additionalCost: number }> {
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: { rentalProduct: true },
    });

    if (!booking) throw new Error("Booking not found");

    const currentEnd = (booking.dates as { endDate: Date }).endDate;
    const additionalDays = Math.ceil((newEndDate.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24));

    if (additionalDays <= 0) throw new Error("New end date must be after current end date");

    // Check availability
    const availability = await this.checkAvailability(
      booking.rentalProductId,
      currentEnd,
      newEndDate
    );

    if (!availability.available) {
      throw new Error("Item is not available for the extension period");
    }

    // Calculate additional cost
    const pricing = (booking.rentalProduct as RentalProduct).pricing as RentalProduct["pricing"];
    let additionalCost = 0;

    if (pricing.dailyRate && additionalDays < 7) {
      additionalCost = pricing.dailyRate * additionalDays;
    } else if (pricing.weeklyRate && additionalDays < 30) {
      additionalCost = pricing.weeklyRate * Math.ceil(additionalDays / 7);
    } else {
      additionalCost = pricing.monthlyRate * Math.ceil(additionalDays / 30);
    }

    const updated = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        dates: {
          ...(booking.dates as Record<string, unknown>),
          endDate: newEndDate,
          extendedUntil: newEndDate,
        },
        extensions: [
          ...(booking.extensions as unknown[]),
          {
            originalEndDate: currentEnd,
            newEndDate,
            additionalCost,
            requestedAt: new Date(),
            approvedAt: new Date(),
          },
        ],
        pricing: {
          ...(booking.pricing as Record<string, unknown>),
          total: (booking.pricing as { total: number }).total + additionalCost,
        },
        payments: [
          ...(booking.payments as unknown[]),
          {
            type: "extension",
            amount: additionalCost,
            status: "pending",
            dueDate: new Date(),
          },
        ],
      },
    });

    return { booking: this.mapRentalBooking(updated), additionalCost };
  }

  /**
   * Get rental analytics
   */
  async getAnalytics(storeId: string): Promise<{
    overview: {
      totalProducts: number;
      activeRentals: number;
      monthlyRevenue: number;
      utilizationRate: number;
    };
    revenueByProduct: Array<{
      productId: string;
      productName: string;
      revenue: number;
      rentals: number;
      utilization: number;
    }>;
    upcomingReturns: Array<{
      bookingId: string;
      customerName: string;
      returnDate: Date;
      productName: string;
    }>;
    overdueRentals: Array<{
      bookingId: string;
      customerName: string;
      dueDate: Date;
      daysOverdue: number;
      lateFees: number;
    }>;
  }> {
    const [products, activeRentals, revenue] = await Promise.all([
      prisma.rentalProduct.count({ where: { storeId } }),
      prisma.rentalBooking.count({
        where: { storeId, status: { in: ["active", "picked_up"] } } },
      }),
      prisma.rentalBooking.aggregate({
        where: {
          storeId,
          status: { in: ["completed", "returned"] },
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { "pricing.subtotal": true },
      }),
    ]);

    return {
      overview: {
        totalProducts: products,
        activeRentals,
        monthlyRevenue: (revenue._sum as { "pricing.subtotal": number })?.["pricing.subtotal"] || 0,
        utilizationRate: 0, // Calculate based on inventory
      },
      revenueByProduct: [],
      upcomingReturns: [],
      overdueRentals: [],
    };
  }

  // Private methods
  private mapReturnCondition(condition: string): RentalInventory["condition"] {
    const mapping: Record<string, RentalInventory["condition"]> = {
      excellent: "excellent",
      good: "good",
      fair: "fair",
      damaged: "fair",
    };
    return mapping[condition] || "fair";
  }

  private mapRentalProduct(data: Record<string, unknown>): RentalProduct {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      productId: String(data.productId),
      type: data.type as RentalProduct["type"],
      status: data.status as RentalProduct["status"],
      pricing: data.pricing as RentalProduct["pricing"],
      availability: data.availability as RentalProduct["availability"],
      bookingSettings: data.bookingSettings as RentalProduct["bookingSettings"],
      condition: data.condition as RentalProduct["condition"],
      maintenanceSchedule: data.maintenanceSchedule as RentalProduct["maintenanceSchedule"],
      location: data.location as RentalProduct["location"],
      terms: data.terms as RentalProduct["terms"],
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }

  private mapRentalBooking(data: Record<string, unknown>): RentalBooking {
    return {
      id: String(data.id),
      rentalProductId: String(data.rentalProductId),
      customerId: String(data.customerId),
      status: data.status as RentalBooking["status"],
      type: data.type as RentalBooking["type"],
      dates: data.dates as RentalBooking["dates"],
      pricing: data.pricing as RentalBooking["pricing"],
      payments: (data.payments as RentalBooking["payments"]) || [],
      securityDeposit: data.securityDeposit as RentalBooking["securityDeposit"],
      pickup: data.pickup as RentalBooking["pickup"],
      return: data.return as RentalBooking["return"],
      extensions: (data.extensions as RentalBooking["extensions"]) || [],
      purchaseOption: data.purchaseOption as RentalBooking["purchaseOption"],
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}

// Export singleton instance
export const rentalService = new RentalService();
