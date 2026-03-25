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

export const GET = withVayvaAPI(
  PERMISSIONS.BOOKINGS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

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
            orderBy: [{ day: "asc" }, { startTime: "asc" }],
          },
          bookings: {
            where: { storeId },
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
              bookings: { where: { storeId } },
            },
          },
        },
      });

      if (!itinerary) {
        return NextResponse.json(
          { error: "Itinerary not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      return NextResponse.json(
        { data: itinerary },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: itineraryId } = await params;
      logger.error("[TRAVEL_ITINERARY_GET]", { error, itineraryId });
      return NextResponse.json(
        { error: "Failed to fetch itinerary" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const PUT = withVayvaAPI(
  PERMISSIONS.BOOKINGS_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const json = await req.json().catch(() => ({}));
      const parseResult = ItineraryUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid itinerary data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const body = parseResult.data;

      const existingItinerary = await prisma.travelItinerary.findFirst({
        where: { id, storeId },
      });

      if (!existingItinerary) {
        return NextResponse.json(
          { error: "Itinerary not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      let startDate: Date | undefined;
      let endDate: Date | undefined;
      if (body.startDate) startDate = new Date(body.startDate);
      if (body.endDate) endDate = new Date(body.endDate);

      if (startDate && endDate && startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const updateData: Record<string, unknown> = {};
      if (body.name) updateData.name = body.name;
      if (body.description !== undefined)
        updateData.description = body.description;
      if (body.destination) updateData.destination = body.destination;
      if (body.startDate) updateData.startDate = startDate;
      if (body.endDate) updateData.endDate = endDate;
      if (body.travelers) updateData.travelers = body.travelers;
      if (body.currency) updateData.currency = body.currency;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.status) updateData.status = body.status;

      const upd = await prisma.travelItinerary.updateMany({
        where: { id, storeId },
        data: updateData,
      });

      if (upd.count === 0) {
        return NextResponse.json(
          { error: "Itinerary not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const itinerary = await prisma.travelItinerary.findFirst({
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
          activities: {
            orderBy: [{ day: "asc" }, { startTime: "asc" }],
          },
        },
      });

      return NextResponse.json(itinerary, {
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      const { id: itineraryId } = await params;
      logger.error("[TRAVEL_ITINERARY_PUT]", {
        error,
        itineraryId,
        storeId,
        userId: user?.id,
      });
      return NextResponse.json(
        { error: "Failed to update itinerary" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
