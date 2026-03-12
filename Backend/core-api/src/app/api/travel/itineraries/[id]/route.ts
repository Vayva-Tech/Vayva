import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ItineraryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  destination: z.string().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  travelers: z.number().int().min(1).optional(),
  currency: z.string().length(3).optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const itinerary = await prisma.travelItinerary.findFirst({
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
        activities: {
          orderBy: [
            { day: "asc" },
            { startTime: "asc" },
          ],
        },
        bookings: {
          select: {
            id: true,
            status: true,
            travelDate: true,
            totalPrice: true,
          },
        },
        _count: {
          select: {
            activities: true,
            bookings: true,
          },
        },
      },
    });

    if (!itinerary) {
      return NextResponse.json(
        { error: "Itinerary not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    return NextResponse.json(
      { data: itinerary },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[TRAVEL_ITINERARY_GET]", { error, itineraryId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch itinerary" },
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
      const parseResult = ItineraryUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid itinerary data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Check if itinerary exists
      const existingItinerary = await prisma.travelItinerary.findFirst({
        where: { id, storeId },
      });

      if (!existingItinerary) {
        return NextResponse.json(
          { error: "Itinerary not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Validate date range if both dates are provided
      let startDate, endDate;
      if (body.startDate) startDate = new Date(body.startDate);
      if (body.endDate) endDate = new Date(body.endDate);
      
      if (startDate && endDate && startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const updateData: any = {};
      if (body.name) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.destination) updateData.destination = body.destination;
      if (body.startDate) updateData.startDate = startDate;
      if (body.endDate) updateData.endDate = endDate;
      if (body.travelers) updateData.travelers = body.travelers;
      if (body.currency) updateData.currency = body.currency;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.status) updateData.status = body.status;

      const itinerary = await prisma.travelItinerary.update({
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
          activities: {
            orderBy: [
              { day: "asc" },
              { startTime: "asc" },
            ],
          },
        },
      });

      return NextResponse.json(itinerary, {
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[TRAVEL_ITINERARY_PUT]", { error, itineraryId: params.id, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to update itinerary" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);