import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// GET /api/rentals/bookings/[id] - Get rental booking details
export const GET = withVayvaAPI(
  PERMISSIONS.BOOKINGS_VIEW,
  async (_, { storeId, params }) => {
    try {
      const { id } = params;

      const booking = await prisma.booking.findUnique({
        where: { id, storeId },
        include: {
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          service: {
            select: {
              title: true,
              description: true,
              price: true,
            },
          },
        },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Rental booking not found" },
          { status: 404 },
        );
      }

      const bookingDetails = {
        id: booking.id,
        serviceId: booking.serviceId,
        serviceName: booking.service?.title || "Unknown Service",
        serviceDescription: booking.service?.description || "",
        servicePrice: booking.service?.price ? Number(booking.service.price) : 0,
        customerId: booking.customerId,
        customerEmail: booking.customer?.email || "Unknown Customer",
        customerName: booking.customer 
          ? `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim()
          : "Unknown Customer",
        customerPhone: booking.customer?.phone || null,
        status: booking.status,
        startsAt: booking.startsAt.toISOString(),
        endsAt: booking.endsAt.toISOString(),
        durationDays: Math.ceil((booking.endsAt.getTime() - booking.startsAt.getTime()) / (1000 * 60 * 60 * 24)),
        notes: booking.notes,
        metadata: booking.metadata,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      };

      return NextResponse.json(
        { booking: bookingDetails },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[RENTAL_BOOKING_GET]", error, { storeId, bookingId: params.id });
      return NextResponse.json(
        { error: "Failed to load rental booking details" },
        { status: 500 },
      );
    }
  },
);

// PATCH /api/rentals/bookings/[id] - Update rental booking
export const PATCH = withVayvaAPI(
  PERMISSIONS.BOOKINGS_MANAGE,
  async (req, { storeId, params }) => {
    try {
      const { id } = params;
      const body = await req.json();
      const result = UpdateBookingSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const { status, startsAt, endsAt, notes } = result.data;

      // Check if booking exists and belongs to store
      const existingBooking = await prisma.booking.findUnique({
        where: { id, storeId },
        select: { 
          serviceId: true,
          startsAt: true,
          endsAt: true,
        },
      });

      if (!existingBooking) {
        return NextResponse.json(
          { error: "Rental booking not found" },
          { status: 404 },
        );
      }

      const updateData: any = {};

      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      
      if (startsAt || endsAt) {
        const newStartsAt = startsAt ? new Date(startsAt) : existingBooking.startsAt;
        const newEndsAt = endsAt ? new Date(endsAt) : existingBooking.endsAt;
        
        // Validate date range
        if (newStartsAt >= newEndsAt) {
          return NextResponse.json(
            { error: "Start date must be before end date" },
            { status: 400 },
          );
        }

        // Check for overlapping bookings (excluding current booking)
        const overlappingBookings = await prisma.booking.findMany({
          where: {
            serviceId: existingBooking.serviceId,
            id: { not: id },
            status: { in: ["CONFIRMED", "PENDING"] },
            OR: [
              {
                startsAt: { lte: newEndsAt },
                endsAt: { gte: newStartsAt },
              },
            ],
          },
        });

        if (overlappingBookings.length > 0) {
          return NextResponse.json(
            { 
              error: "Selected dates conflict with existing bookings",
              conflictingBookings: overlappingBookings.map(b => ({
                id: b.id,
                startsAt: b.startsAt.toISOString(),
                endsAt: b.endsAt.toISOString(),
              })),
            },
            { status: 409 },
          );
        }

        updateData.startsAt = newStartsAt;
        updateData.endsAt = newEndsAt;
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          service: {
            select: {
              title: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          booking: {
            id: booking.id,
            serviceId: booking.serviceId,
            serviceName: booking.service?.title || "Unknown Service",
            customerId: booking.customerId,
            customerEmail: booking.customer?.email || "Unknown Customer",
            customerName: booking.customer 
              ? `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim()
              : "Unknown Customer",
            status: booking.status,
            startsAt: booking.startsAt.toISOString(),
            endsAt: booking.endsAt.toISOString(),
            notes: booking.notes,
            updatedAt: booking.updatedAt.toISOString(),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[RENTAL_BOOKING_UPDATE_PATCH]", error, { storeId, bookingId: params.id });
      return NextResponse.json(
        { error: "Failed to update rental booking" },
        { status: 500 },
      );
    }
  },
);

// DELETE /api/rentals/bookings/[id] - Cancel rental booking
export const DELETE = withVayvaAPI(
  PERMISSIONS.BOOKINGS_MANAGE,
  async (_, { storeId, params }) => {
    try {
      const { id } = params;

      // Check if booking exists and belongs to store
      const booking = await prisma.booking.findUnique({
        where: { id, storeId },
        select: { status: true },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Rental booking not found" },
          { status: 404 },
        );
      }

      if (booking.status === "CANCELLED") {
        return NextResponse.json(
          { error: "Booking is already cancelled" },
          { status: 400 },
        );
      }

      // Cancel the booking
      const cancelledBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
      });

      return NextResponse.json(
        { 
          message: "Rental booking cancelled successfully",
          booking: {
            id: cancelledBooking.id,
            status: "CANCELLED",
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[RENTAL_BOOKING_CANCEL_DELETE]", error, { storeId, bookingId: params.id });
      return NextResponse.json(
        { error: "Failed to cancel rental booking" },
        { status: 500 },
      );
    }
  },
);