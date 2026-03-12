import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { BookingService } from "@/services/BookingService";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { UpdateBookingData } from "@/types/bookings";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Bad Request";
}
// GET Booking by ID
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId, params }) => {
    const { id } = await params;
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: id, storeId },
      });
      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(booking, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[BOOKINGS_ID_GET]", error, { storeId, bookingId: id });
      return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 400 },
      );
    }
  },
);
// PUT Update Booking
export const PUT = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params }) => {
    const { id } = await params;
    try {
      const parsedBody: unknown = await request.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const startsAtRaw = getString(body.startsAt);
      const endsAtRaw = getString(body.endsAt);

      const startsAt = startsAtRaw ? new Date(startsAtRaw) : undefined;
      const endsAt = endsAtRaw ? new Date(endsAtRaw) : undefined;

      if (
        (startsAt && Number.isNaN(startsAt.getTime())) ||
        (endsAt && Number.isNaN(endsAt.getTime()))
      ) {
        return NextResponse.json(
          { error: "Invalid booking date(s)" },
          { status: 400 },
        );
      }

      // Format dates if present
      const updateData: UpdateBookingData = {
        startsAt,
        endsAt,
        customerId: getString(body.customerId),
        customerEmail: getString(body.customerEmail),
        customerName: getString(body.customerName),
        notes: getString(body.notes),
        status: getString(body.status),
      };
      const booking = await BookingService.updateBooking(
        storeId,
        id,
        updateData,
      );
      return NextResponse.json(booking);
    } catch (error: unknown) {
      logger.error("[BOOKINGS_ID_PUT]", error, { storeId, bookingId: id });
      return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 400 },
      );
    }
  },
);
// DELETE Booking
export const DELETE = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params }) => {
    const { id } = await params;
    try {
      await prisma.booking.delete({
        where: { id: id, storeId },
      });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[BOOKINGS_ID_DELETE]", error, { storeId, bookingId: id });
      return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 400 },
      );
    }
  },
);
