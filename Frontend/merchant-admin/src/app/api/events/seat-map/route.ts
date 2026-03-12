import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const seatMapSchema = z.object({
  eventId: z.string().uuid(),
  svgLayout: z.string().min(1), // SVG content
  sections: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    priceMultiplier: z.number().min(0.1).max(10).default(1),
  })),
  seats: z.array(z.object({
    id: z.string(),
    section: z.string(),
    row: z.string(),
    number: z.string(),
    x: z.number(),
    y: z.number(),
    status: z.enum(["available", "reserved", "sold", "blocked"]).default("available"),
    ticketTierId: z.string().uuid().optional(),
  })),
});

/**
 * GET /api/events/seat-map?eventId=xxx
 * Get seat map for an event
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
    }

    const seatMap = await prisma.eventSeatMap.findUnique({
      where: { eventId },
    });

    if (!seatMap) {
      return NextResponse.json(
        { error: "Seat map not found" },
        { status: 404 }
      );
    }

    // Get current availability from sold tickets
    const soldSeats = await prisma.eventCheckIn.findMany({
      where: {
        ticketId: { startsWith: `${eventId}_` },
      },
      select: {
        seatAssigned: true,
      },
    });

    const soldSeatIds = new Set(soldSeats.map((s: any) => s.seatAssigned).filter(Boolean));

    // Update seat statuses based on sales
    const seatsWithStatus = (seatMap.seats as Array<{
      id: string;
      section: string;
      row: string;
      number: string;
      x: number;
      y: number;
      status: string;
      ticketTierId?: string;
    }>).map((seat) => ({
      ...seat,
      status: soldSeatIds.has(seat.id) ? "sold" : seat.status,
    }));

    return NextResponse.json({
      ...seatMap,
      seats: seatsWithStatus,
      stats: {
        total: seatsWithStatus.length,
        available: seatsWithStatus.filter((s: any) => s.status === "available").length,
        reserved: seatsWithStatus.filter((s: any) => s.status === "reserved").length,
        sold: seatsWithStatus.filter((s: any) => s.status === "sold").length,
      },
    });
  } catch (error: unknown) {
    logger.error("[SEAT_MAP_GET] Failed to fetch seat map", { error });
    return NextResponse.json(
      { error: "Failed to fetch seat map" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/seat-map
 * Create or update seat map
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = seatMapSchema.parse(body);

    // Check if seat map exists
    const existing = await prisma.eventSeatMap.findUnique({
      where: { eventId: validated.eventId },
    });

    const seatMap = existing
      ? await prisma.eventSeatMap.update({
          where: { eventId: validated.eventId },
          data: {
            svgLayout: validated.svgLayout,
            sections: validated.sections,
            seats: validated.seats,
          },
        })
      : await prisma.eventSeatMap.create({
          data: {
            eventId: validated.eventId,
            svgLayout: validated.svgLayout,
            sections: validated.sections,
            seats: validated.seats,
          },
        });

    logger.info("[SEAT_MAP_POST] Seat map saved", {
      eventId: validated.eventId,
      seats: validated.seats.length,
    });

    return NextResponse.json({ seatMap }, { status: existing ? 200 : 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[SEAT_MAP_POST] Failed to save seat map", { error });
    return NextResponse.json(
      { error: "Failed to save seat map" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/events/seat-map
 * Update specific seat statuses (for reservations)
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { eventId, seatUpdates } = z.object({
      eventId: z.string().uuid(),
      seatUpdates: z.array(z.object({
        seatId: z.string(),
        status: z.enum(["available", "reserved", "sold", "blocked"]),
      })),
    }).parse(body);

    const seatMap = await prisma.eventSeatMap.findUnique({
      where: { eventId },
    });

    if (!seatMap) {
      return NextResponse.json(
        { error: "Seat map not found" },
        { status: 404 }
      );
    }

    // Update seat statuses
    const seats = seatMap.seats as Array<{
      id: string;
      section: string;
      row: string;
      number: string;
      x: number;
      y: number;
      status: string;
      ticketTierId?: string;
    }>;

    for (const update of seatUpdates) {
      const seat = seats.find(s => s.id === update.seatId);
      if (seat) {
        seat.status = update.status;
      }
    }

    await prisma.eventSeatMap.update({
      where: { eventId },
      data: { seats },
    });

    return NextResponse.json({ success: true, updated: seatUpdates.length });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[SEAT_MAP_PATCH] Failed to update seats", { error });
    return NextResponse.json(
      { error: "Failed to update seats" },
      { status: 500 }
    );
  }
}
