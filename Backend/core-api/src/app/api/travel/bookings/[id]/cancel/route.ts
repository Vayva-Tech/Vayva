import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const POST = withVayvaAPI(
  PERMISSIONS.BOOKINGS_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext & { params: { id: string } }) => {
    const requestId = correlationId;
    try {
      const { id } = params;

      // Check if booking exists
      const booking = await prisma.travelBooking.findFirst({
        where: { id, storeId },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Check if booking can be cancelled
      if (booking.status === "cancelled") {
        return NextResponse.json(
          { error: "Booking is already cancelled" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      if (booking.status === "completed") {
        return NextResponse.json(
          { error: "Cannot cancel completed booking" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const cancelResult = await prisma.travelBooking.updateMany({
        where: { id, storeId },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      });

      if (cancelResult.count === 0) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      const cancelledBooking = await prisma.travelBooking.findFirst({
        where: { id, storeId },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!cancelledBooking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Log cancellation reason (if provided in request body)
      try {
        const json = await req.json().catch(() => ({}));
        const reason = json.reason || "User requested cancellation";
        
        await prisma.travelBookingCancellation.create({
          data: {
            bookingId: id,
            reason,
            cancelledBy: user?.id || "system",
            storeId,
          },
        });
      } catch (logError) {
        logger.warn("[TRAVEL_BOOKING_CANCEL_LOG]", { 
          error: logError, 
          bookingId: id 
        });
      }

      return NextResponse.json(cancelledBooking, {
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[TRAVEL_BOOKING_CANCEL]", { error, bookingId: params.id, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to cancel booking" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);