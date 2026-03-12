import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const guestSchema = z.object({
  customerId: z.string(),
  venueId: z.string(),
  eventDate: z.string().datetime(),
  guestCount: z.number().int().positive().default(1),
  guestType: z.enum(["general", "vip", "host"]).default("general"),
  tableReservationId: z.string().optional(),
  arrivalTime: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "checked_in", "cancelled", "no_show"]),
  arrivalTime: z.string().optional(),
});

/**
 * GET /api/nightlife/guestlist?venueId=xxx&date=xxx&status=xxx
 * List guest list entries
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const guestType = searchParams.get("guestType");

    if (!venueId) {
      return NextResponse.json(
        { error: "Venue ID required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { venueId };
    
    if (date) {
      const eventDate = new Date(date);
      const startOfDay = new Date(eventDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      where.eventDate = { gte: startOfDay, lt: endOfDay };
    }
    
    if (status) (where as any).status = status;
    if (guestType) (where as any).guestType = guestType;

    const guests = await prisma.guestList?.findMany({
      where,
      orderBy: [{ guestType: "desc" }, { createdAt: "asc" }] as any,
    });

    // Calculate stats
    const guestsAny = guests as any[];
    const stats = {
      total: guests.length,
      totalGuests: guests.reduce((sum: number, g: { guestCount: number }) => sum + g.guestCount, 0),
      byType: {
        general: guestsAny.filter((g: any) => g.guestType === "general").length,
        vip: guestsAny.filter((g: any) => g.guestType === "vip").length,
        host: guestsAny.filter((g: any) => g.guestType === "host").length,
      },
      byStatus: {
        pending: guestsAny.filter((g: any) => g.status === "pending").length,
        confirmed: guestsAny.filter((g: any) => g.status === "confirmed").length,
        checkedIn: guestsAny.filter((g: any) => g.status === "checked_in").length,
        cancelled: guestsAny.filter((g: any) => g.status === "cancelled").length,
      },
      vipGuests: guestsAny
        .filter((g: any) => g.guestType === "vip")
        .reduce((sum: number, g: any) => sum + (g.guestCount || 0), 0),
    };

    return NextResponse.json({ guests, stats });
  } catch (error: unknown) {
    logger.error("[GUESTLIST_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch guest list" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nightlife/guestlist
 * Add guest to list
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = guestSchema.parse(body);

    // Check for duplicate
    const existing = await prisma.guestList?.findFirst({
      where: {
        customerId: validated.customerId,
        venueId: validated.venueId,
        eventDate: new Date(validated.eventDate),
      } as any,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Guest already on list for this date" },
        { status: 409 }
      );
    }

    const guest = await prisma.guestList?.create({
      data: {
        ...validated,
        status: "pending" as any,
        eventDate: new Date(validated.eventDate),
      } as any,
    });

    logger.info("[GUESTLIST_POST] Added", {
      guestId: guest.id,
      customerId: validated.customerId,
      venueId: validated.venueId,
    });

    return NextResponse.json({ guest }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[GUESTLIST_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to add to guest list" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/nightlife/guestlist?id=xxx
 * Update guest status
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Guest entry ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = statusUpdateSchema.parse(body);

    const guest = await prisma.guestList?.update({
      where: { id },
      data: {
        status: (validated as any).status,
        arrivalTime: validated.arrivalTime,
        checkedInAt: (validated as any).status === "checked_in" ? new Date() : undefined,
      } as any,
    });

    logger.info("[GUESTLIST_PATCH] Updated", {
      guestId: id,
      status: (validated as any).status,
    });

    return NextResponse.json({ guest });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[GUESTLIST_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update guest entry" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/nightlife/guestlist?id=xxx
 * Remove from guest list
 */
export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Guest entry ID required" },
        { status: 400 }
      );
    }

    await prisma.guestList?.delete({ where: { id } });

    logger.info("[GUESTLIST_DELETE] Removed", { guestId: id });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error("[GUESTLIST_DELETE] Failed", { error });
    return NextResponse.json(
      { error: "Failed to remove from guest list" },
      { status: 500 }
    );
  }
}
