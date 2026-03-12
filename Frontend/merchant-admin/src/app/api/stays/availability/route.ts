import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const availabilityUpdateSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  isAvailable: z.boolean(),
  priceOverride: z.number().positive().optional(),
  minimumStay: z.number().int().min(1).optional(),
  notes: z.string().max(500).optional(),
});

const bulkDateRangeSchema = z.object({
  accommodationId: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isAvailable: z.boolean(),
  priceOverride: z.number().positive().optional(),
  minimumStay: z.number().int().min(1).optional(),
});

/**
 * GET /api/stays/availability?accommodationId=xxx&start=2024-01-01&end=2024-01-31
 * Get availability calendar for an accommodation
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const accommodationId = searchParams.get("accommodationId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!accommodationId) {
      return NextResponse.json(
        { error: "Accommodation ID required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { accommodationId };
    
    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const availability = await prisma.availabilityCalendar.findMany({
      where,
      orderBy: { date: "asc" },
    });

    // Calculate summary stats
    const availableCount = availability.filter((a: any) => a.isAvailable).length;
    const blockedCount = availability.filter((a: any) => !a.isAvailable).length;

    return NextResponse.json({
      availability,
      summary: {
        total: availability.length,
        available: availableCount,
        blocked: blockedCount,
      },
    });
  } catch (error: unknown) {
    logger.error("[AVAILABILITY_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stays/availability
 * Update availability for specific dates
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = availabilityUpdateSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const accommodationId = searchParams.get("accommodationId");

    if (!accommodationId) {
      return NextResponse.json(
        { error: "Accommodation ID required" },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const dates = validated.dates.map((d: unknown) => new Date(d as string | number | Date));

    // Use upsert to create or update availability entries
    const operations = dates.map((date: Date) => 
      prisma.availabilityCalendar.upsert({
        where: {
          accommodationId_date: {
            accommodationId,
            date,
          },
        },
        update: {
          isAvailable: validated.isAvailable,
          ...(validated.priceOverride !== undefined && { priceOverride: validated.priceOverride }),
          ...(validated.minimumStay !== undefined && { minimumStay: validated.minimumStay }),
          ...(validated.notes !== undefined && { notes: validated.notes }),
        },
        create: {
          accommodationId,
          date,
          isAvailable: validated.isAvailable,
          priceOverride: validated.priceOverride,
          minimumStay: validated.minimumStay || 1,
          notes: validated.notes,
        },
      })
    );

    const results = await prisma.$transaction(operations);

    logger.info("[AVAILABILITY_POST] Updated", {
      accommodationId,
      datesCount: validated.dates.length,
      isAvailable: validated.isAvailable,
    });

    return NextResponse.json({
      message: `Updated ${results.length} dates`,
      updated: results.length,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[AVAILABILITY_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stays/availability/bulk
 * Bulk update availability for a date range
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = bulkDateRangeSchema.parse(body);

    const startDate = new Date(validated.startDate);
    const endDate = new Date(validated.endDate);

    // Generate all dates in range
    const dates: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Upsert availability for each date
    const operations = dates.map((date: Date) =>
      prisma.availabilityCalendar.upsert({
        where: {
          accommodationId_date: {
            accommodationId: validated.accommodationId,
            date,
          },
        },
        update: {
          isAvailable: validated.isAvailable,
          ...(validated.priceOverride !== undefined && { priceOverride: validated.priceOverride }),
          ...(validated.minimumStay !== undefined && { minimumStay: validated.minimumStay }),
        },
        create: {
          accommodationId: validated.accommodationId,
          date,
          isAvailable: validated.isAvailable,
          priceOverride: validated.priceOverride,
          minimumStay: validated.minimumStay || 1,
        },
      })
    );

    const results = await prisma.$transaction(operations);

    logger.info("[AVAILABILITY_PATCH] Bulk updated", {
      accommodationId: validated.accommodationId,
      dateRange: `${validated.startDate} to ${validated.endDate}`,
      datesCount: dates.length,
      isAvailable: validated.isAvailable,
    });

    return NextResponse.json({
      message: `Updated ${results.length} dates`,
      dateRange: { start: validated.startDate, end: validated.endDate },
      updated: results.length,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[AVAILABILITY_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to bulk update availability" },
      { status: 500 }
    );
  }
}
