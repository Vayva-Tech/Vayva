import { NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { BookingService } from "@/services/BookingService";
import { logger } from "@/lib/logger";
import type { CreateBookingData } from "@/types/bookings";
import { BookingCreateSchema } from "@/lib/validations/booking";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Bad Request";
}
// GET Bookings (with date filter)
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const startParam = searchParams.get("start");
      const endParam = searchParams.get("end");
      const start = startParam ? new Date(startParam) : undefined;
      const end = endParam ? new Date(endParam) : undefined;
      const bookings = await BookingService.getBookings(storeId, start, end);
      return NextResponse.json(bookings, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[BOOKINGS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 },
      );
    }
  },
);
// POST Create Booking
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId }: APIContext) => {
    try {
      const body = await request.json().catch(() => ({}));
      const validation = BookingCreateSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.format(),
          },
          { status: 400 },
        );
      }

      const { startsAt, endsAt, ...rest } = validation.data;

      // Convert ISO strings to Date objects
      const startDate = new Date(startsAt);
      const endDate = endsAt ? new Date(endsAt) : undefined;

      // Extra sanity check for dates (although Zod .datetime() covers most)
      if (isNaN(startDate.getTime()) || (endDate && isNaN(endDate.getTime()))) {
        return NextResponse.json(
          { error: "Invalid date format" },
          { status: 400 },
        );
      }

      const payload: CreateBookingData = {
        ...rest,
        startsAt: startDate,
        endsAt: endDate,
      };

      const booking = await BookingService.createBooking(storeId, payload);
      return NextResponse.json(booking);
    } catch (error: unknown) {
      logger.error("[BOOKINGS_POST]", error, { storeId });
      return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 400 },
      );
    }
  },
);
