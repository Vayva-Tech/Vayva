import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const tableSchema = z.object({
  venueId: z.string(),
  tableNumber: z.string(),
  capacity: z.number().int().positive(),
  minSpend: z.number().positive(),
  tableType: z.enum(["standard", "vip", "booth", "stage_front", "private_room"]).default("standard"),
  location: z.string().optional(),
  description: z.string().max(500).optional(),
  amenities: z.array(z.string()).default([]),
});

const reservationSchema = z.object({
  customerId: z.string(),
  venueId: z.string(),
  tableId: z.string(),
  date: z.string().datetime(),
  arrivalTime: z.string(),
  guestCount: z.number().int().positive(),
  occasion: z.enum(["none", "birthday", "anniversary", "business", "special_event"]).default("none"),
  specialRequests: z.string().max(1000).optional(),
  bottleService: z.boolean().default(false),
});

const statusUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"]),
});

/**
 * GET /api/nightlife/tables?venueId=xxx&date=xxx&capacity=xxx
 * List tables with availability
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const date = searchParams.get("date");
    const capacity = searchParams.get("capacity");
    const tableType = searchParams.get("tableType");

    if (!venueId) {
      return NextResponse.json(
        { error: "Venue ID required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { venueId };
    if (tableType) where.tableType = tableType;
    if (capacity) where.capacity = { gte: parseInt(capacity) };

    const tables = await (prisma as any).nightlifeTable?.findMany({
      where,
      orderBy: { minSpend: "asc" },
    });

    // If date provided, check availability
    const availability: Record<string, boolean> = {};
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const reservations = await (prisma as any).tableReservation?.findMany({
        where: {
          tableId: { in: tables.map((t: { id: string }) => t.id) },
          date: { gte: startOfDay, lt: endOfDay },
          status: { in: ["pending", "confirmed"] },
        },
        select: { tableId: true },
      });

      const reservedIds = new Set(reservations.map((r: { tableId: string }) => r.tableId));
      tables.forEach((t: { id: string; status: string }) => {
        availability[t.id] = !reservedIds.has(t.id) && (t as any).status === "available";
      });
    }

    // Calculate revenue stats
    const reservations = await (prisma as any).tableReservation?.findMany({
      where: { venueId },
    });

    const stats = {
      total: tables.length,
      byType: {
        standard: tables.filter((t: { tableType: string }) => t.tableType === "standard").length,
        vip: tables.filter((t: { tableType: string }) => t.tableType === "vip").length,
        booth: tables.filter((t: { tableType: string }) => t.tableType === "booth").length,
        private: tables.filter((t: { tableType: string }) => t.tableType === "private_room").length,
      },
      available: tables.filter((t: { status: string }) => (t as any).status === "available").length,
      revenueToday: reservations
        .filter((r: { status: string; createdAt: Date }) => 
          (r as any).status === "completed" && 
          new Date(r.createdAt).toDateString() === new Date().toDateString()
        )
        .reduce((sum: number, r: { finalSpend: number }) => sum + (Number(r.finalSpend) || 0), 0),
      reservationsPending: reservations.filter((r: { status: string }) => (r as any).status === "pending").length,
    };

    return NextResponse.json({ tables, availability, stats });
  } catch (error: unknown) {
    logger.error("[NIGHTLIFE_TABLES_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nightlife/tables
 * Create a new table
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = tableSchema.parse(body);

    // Check for duplicate table number
    const existing = await (prisma as any).nightlifeTable?.findFirst({
      where: {
        venueId: validated.venueId,
        tableNumber: validated.tableNumber,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Table number already exists" },
        { status: 409 }
      );
    }

    const table = await (prisma as any).nightlifeTable?.create({
      data: {
        ...validated,
        status: "available",
      },
    });

    logger.info("[NIGHTLIFE_TABLE_POST] Created", {
      tableId: table.id,
      venueId: validated.venueId,
      tableNumber: validated.tableNumber,
    });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[NIGHTLIFE_TABLE_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to create table" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nightlife/tables/reserve
 * Create a table reservation
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = reservationSchema.parse(body);

    // Verify table exists and is available
    const table = await (prisma as any).nightlifeTable?.findUnique({
      where: { id: validated.tableId },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    // Check for existing reservation on this date
    const date = new Date(validated.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existing = await (prisma as any).tableReservation?.findFirst({
      where: {
        tableId: validated.tableId,
        date: { gte: startOfDay, lt: endOfDay },
        status: { in: ["pending", "confirmed"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Table already reserved for this date" },
        { status: 409 }
      );
    }

    const reservation = await (prisma as any).tableReservation?.create({
      data: {
        ...validated,
        status: "pending",
        minSpend: table.minSpend,
        finalSpend: 0,
        date: new Date(validated.date),
      },
    });

    logger.info("[NIGHTLIFE_RESERVATION_POST] Created", {
      reservationId: reservation.id,
      tableId: validated.tableId,
      customerId: validated.customerId,
      date: validated.date,
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[NIGHTLIFE_RESERVATION_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/nightlife/tables/reservation?id=xxx
 * Update reservation status
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Reservation ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = statusUpdateSchema.parse(body);

    const reservation = await (prisma as any).tableReservation?.update({
      where: { id },
      data: {
        status: (validated as any).status,
        updatedAt: new Date(),
      },
    });

    logger.info("[NIGHTLIFE_RESERVATION_PATCH] Updated", {
      reservationId: id,
      status: (validated as any).status,
    });

    return NextResponse.json({ reservation });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[NIGHTLIFE_RESERVATION_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nightlife/tables/reservation/complete?id=xxx
 * Complete a reservation with final spend
 */
export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Reservation ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { finalSpend } = z.object({
      finalSpend: z.number().positive(),
    }).parse(body);

    const reservation = await (prisma as any).tableReservation?.update({
      where: { id },
      data: {
        status: "completed",
        finalSpend,
        updatedAt: new Date(),
      },
    });

    logger.info("[NIGHTLIFE_RESERVATION_COMPLETE] Completed", {
      reservationId: id,
      finalSpend,
    });

    return NextResponse.json({ reservation });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[NIGHTLIFE_RESERVATION_COMPLETE] Failed", { error });
    return NextResponse.json(
      { error: "Failed to complete reservation" },
      { status: 500 }
    );
  }
}
