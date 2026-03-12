import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const BookingUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  travelDate: z.string().datetime().optional(),
  returnDate: z.string().datetime().optional(),
  destination: z.string().min(1).optional(),
  travelers: z.number().int().min(1).optional(),
  totalPrice: z.number().positive().optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context (this would typically come from auth middleware)
    const storeId = "test-store-id"; // Placeholder - would come from auth context

    const booking = await prisma.travelBooking.findFirst({
      where: { id, storeId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    return NextResponse.json(
      { data: booking },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[TRAVEL_BOOKING_GET]", { error, bookingId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export const PUT = withVayvaAPI(
  PERMISSIONS.BOOKINGS_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext & { params: { id: string } }) => {
    const requestId = correlationId;
    try {
      const { id } = params;
      const json = await req.json().catch(() => ({}));
      const parseResult = BookingUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid booking data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Check if booking exists
      const existingBooking = await prisma.travelBooking.findFirst({
        where: { id, storeId },
      });

      if (!existingBooking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Prevent updating cancelled bookings
      if (existingBooking.status === "cancelled") {
        return NextResponse.json(
          { error: "Cannot update cancelled booking" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const updateData: any = {};
      if (body.status) updateData.status = body.status;
      if (body.travelDate) updateData.travelDate = new Date(body.travelDate);
      if (body.returnDate) updateData.returnDate = new Date(body.returnDate);
      if (body.destination) updateData.destination = body.destination;
      if (body.travelers) updateData.travelers = body.travelers;
      if (body.totalPrice) updateData.totalPrice = body.totalPrice;
      if (body.notes !== undefined) updateData.notes = body.notes;

      const booking = await prisma.travelBooking.update({
        where: { id },
        data: updateData,
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

      return NextResponse.json(booking, {
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[TRAVEL_BOOKING_PUT]", { error, bookingId: params.id, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);