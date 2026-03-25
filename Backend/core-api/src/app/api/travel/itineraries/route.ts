import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ItineraryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  customerId: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  destination: z.string().optional(),
});

const ItineraryCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  customerId: z.string(),
  destination: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  travelers: z.number().int().min(1).default(1),
  currency: z.string().length(3).default("USD"),
  notes: z.string().optional(),
  activities: z.array(z.object({
    day: z.number().int().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().optional(),
    cost: z.number().nonnegative().optional(),
  })).default([]),
});

export const GET = withVayvaAPI(
  PERMISSIONS.BOOKINGS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = ItineraryQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, customerId, status, destination } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (customerId) where.customerId = customerId;
      if (status) where.status = status;
      if (destination) where.destination = { contains: destination, mode: "insensitive" };

      const [itineraries, total] = await Promise.all([
        prisma.travelItinerary.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: {
                activities: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.travelItinerary.count({ where }),
      ]);

      return NextResponse.json(
        {
          data: itineraries,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[TRAVEL_ITINERARIES_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch itineraries" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.BOOKINGS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = ItineraryCreateSchema.safeParse(json);

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

      // Verify customer exists
      const customer = await prisma.customer.findFirst({
        where: { id: body.customerId, storeId },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Validate date range
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const itinerary = await prisma.travelItinerary.create({
        data: {
          storeId,
          name: body.name,
          description: body.description,
          customerId: body.customerId,
          destination: body.destination,
          startDate,
          endDate,
          travelers: body.travelers,
          currency: body.currency,
          notes: body.notes,
          status: "draft",
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Create activities if provided
      if (body.activities.length > 0) {
        await prisma.travelItineraryActivity.createMany({
          data: body.activities.map(activity => ({
            itineraryId: itinerary.id,
            day: activity.day,
            title: activity.title,
            description: activity.description,
            startTime: activity.startTime,
            endTime: activity.endTime,
            location: activity.location,
            estimatedCost: activity.cost,
            storeId,
          })),
        });
      }

      // Fetch complete itinerary with activities
      const completeItinerary = await prisma.travelItinerary.findFirst({
        where: { id: itinerary.id, storeId },
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

      return NextResponse.json(completeItinerary, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[TRAVEL_ITINERARIES_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create itinerary" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);