import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const bookingSchema = z.object({
  accommodationId: z.string(),
  customerId: z.string(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().int().min(1),
  guestNames: z.array(z.string()).default([]),
  specialRequests: z.string().max(1000).optional(),
  cancellationPolicy: z.enum(["flexible", "moderate", "strict"]).default("moderate"),
});

const statusUpdateSchema = z.object({
  status: z.enum(["confirmed", "checked_in", "checked_out", "cancelled", "no_show"]),
  checkInTime: z.string().datetime().optional(),
  checkOutTime: z.string().datetime().optional(),
  keyCode: z.string().optional(),
  wifiCode: z.string().optional(),
});

const paymentSchema = z.object({
  amount: z.number().positive(),
});

/**
 * GET /api/stays/bookings?storeId=xxx&status=xxx&start=xxx&end=xxx
 * List bookings for a store
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const accommodationId = searchParams.get("accommodationId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    
    if (status) where.status = status;
    if (accommodationId) where.accommodationId = accommodationId;
    
    if (start && end) {
      where.OR = [
        {
          checkIn: {
            gte: new Date(start),
            lte: new Date(end),
          },
        },
        {
          checkOut: {
            gte: new Date(start),
            lte: new Date(end),
          },
        },
      ];
    }

    const bookings = await prisma.accommodationBooking.findMany({
      where,
      orderBy: { checkIn: "asc" },
    });

    // Calculate occupancy stats
    const today = new Date();
    const checkedInToday = bookings.filter(
      (b: { checkIn: Date | string; status: string }) => 
        new Date(b.checkIn).toDateString() === today.toDateString() && 
        b.status === "checked_in"
    ).length;
    
    const checkedOutToday = bookings.filter(
      (b: { checkOut: Date | string; status: string }) => 
        new Date(b.checkOut).toDateString() === today.toDateString() && 
        b.status === "checked_out"
    ).length;

    return NextResponse.json({
      bookings,
      stats: {
        total: bookings.length,
        confirmed: bookings.filter((b: { status: string }) => b.status === "confirmed").length,
        checkedIn: bookings.filter((b: { status: string }) => b.status === "checked_in").length,
        checkedOut: bookings.filter((b: { status: string }) => b.status === "checked_out").length,
        cancelled: bookings.filter((b: { status: string }) => b.status === "cancelled").length,
        checkedInToday,
        checkedOutToday,
      },
    });
  } catch (error) {
    logger.error("[BOOKINGS_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stays/bookings
 * Create a new booking
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = bookingSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Check availability for the date range
    const checkIn = new Date(validated.checkIn);
    const checkOut = new Date(validated.checkOut);
    
    const dates: Date[] = [];
    const current = new Date(checkIn);
    while (current < checkOut) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const availability = await prisma.availabilityCalendar.findMany({
      where: {
        accommodationId: validated.accommodationId,
        date: { in: dates },
      },
    });

    // Check if all dates are available
    const unavailableDates = availability.filter((a: { isAvailable: boolean }) => !a.isAvailable);
    if (unavailableDates.length > 0) {
      return NextResponse.json(
        { 
          error: "Accommodation not available for selected dates",
          unavailableDates: unavailableDates.map((a: { date: Date }) => a.date),
        },
        { status: 409 }
      );
    }

    // Check minimum stay requirements
    const minStayViolations = availability.filter(
      (a: { minimumStay: number }) => a.minimumStay > dates.length
    );
    if (minStayViolations.length > 0) {
      return NextResponse.json(
        { 
          error: "Minimum stay requirement not met",
          requiredNights: Math.max(...minStayViolations.map((a: { minimumStay: number }) => a.minimumStay)),
          requestedNights: dates.length,
        },
        { status: 409 }
      );
    }

    // Calculate total amount
    const accommodation = await prisma.accommodation.findUnique({
      where: { id: validated.accommodationId },
    });

    if (!accommodation) {
      return NextResponse.json(
        { error: "Accommodation not found" },
        { status: 404 }
      );
    }

    // Calculate price with any overrides
    let totalAmount = 0;
    for (const date of dates) {
      const dayAvailability = availability.find(
        (a: { date: Date }) => a.date.toDateString() === date.toDateString()
      );
      const dayPrice = dayAvailability?.priceOverride ?? accommodation.basePrice;
      totalAmount += Number(dayPrice);
    }

    // Add fees
    totalAmount += Number(accommodation.cleaningFee) + Number(accommodation.serviceFee);

    // Create booking
    const booking = await prisma.accommodationBooking.create({
      data: {
        storeId,
        accommodationId: validated.accommodationId,
        customerId: validated.customerId,
        checkIn,
        checkOut,
        guests: validated.guests,
        guestNames: validated.guestNames,
        specialRequests: validated.specialRequests,
        cancellationPolicy: validated.cancellationPolicy,
        totalAmount,
        amountPaid: 0,
        status: "confirmed",
      },
    });

    // Mark dates as unavailable
    await prisma.availabilityCalendar.updateMany({
      where: {
        accommodationId: validated.accommodationId,
        date: { in: dates },
      },
      data: { isAvailable: false },
    });

    logger.info("[BOOKINGS_POST] Created", {
      bookingId: booking.id,
      storeId,
      accommodationId: validated.accommodationId,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[BOOKINGS_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stays/bookings?id=xxx
 * Update booking status (check-in, check-out, cancel)
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = statusUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {
      status: validated.status,
      updatedAt: new Date(),
    };

    if (validated.checkInTime) updateData.checkInTime = new Date(validated.checkInTime);
    if (validated.checkOutTime) updateData.checkOutTime = new Date(validated.checkOutTime);
    if (validated.keyCode !== undefined) updateData.keyCode = validated.keyCode;
    if (validated.wifiCode !== undefined) updateData.wifiCode = validated.wifiCode;

    const booking = await prisma.accommodationBooking.update({
      where: { id },
      data: updateData,
    });

    // If cancelled, free up the dates
    if (validated.status === "cancelled") {
      const dates: Date[] = [];
      const current = new Date(booking.checkIn);
      while (current < new Date(booking.checkOut)) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      await prisma.availabilityCalendar.updateMany({
        where: {
          accommodationId: booking.accommodationId,
          date: { in: dates },
        },
        data: { isAvailable: true },
      });
    }

    logger.info("[BOOKINGS_PATCH] Updated", {
      bookingId: id,
      status: validated.status,
    });

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[BOOKINGS_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stays/bookings/payment?id=xxx
 * Record payment for a booking
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = paymentSchema.parse(body);

    const booking = await prisma.accommodationBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const newAmountPaid = Number(booking.amountPaid) + validated.amount;
    const isFullyPaid = newAmountPaid >= Number(booking.totalAmount);

    const updated = await prisma.accommodationBooking.update({
      where: { id },
      data: {
        amountPaid: newAmountPaid,
        updatedAt: new Date(),
      },
    });

    logger.info("[BOOKINGS_PAYMENT] Recorded", {
      bookingId: id,
      amount: validated.amount,
      newTotalPaid: newAmountPaid,
      isFullyPaid,
    });

    return NextResponse.json({
      booking: updated,
      payment: {
        amount: validated.amount,
        totalPaid: newAmountPaid,
        remaining: Number(booking.totalAmount) - newAmountPaid,
        isFullyPaid,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[BOOKINGS_PAYMENT] Failed", { error });
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
