import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const checkInSchema = z.object({
  orderId: z.string(),
  ticketId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  ticketTier: z.string(),
  seatAssigned: z.string().optional(),
  plusOnes: z.number().int().min(0).max(10).default(0),
  entryMethod: z.enum(["scan", "manual", "nfc"]).default("scan"),
  notes: z.string().optional(),
});

const scanSchema = z.object({
  qrCode: z.string(), // QR code data
  eventId: z.string().uuid(),
  entryMethod: z.enum(["scan", "manual", "nfc"]).default("scan"),
});

/**
 * GET /api/events/check-in?eventId=xxx
 * Get check-in list for an event
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const dateFrom = searchParams.get("dateFrom");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
    }

    // Get check-ins
    const where: Record<string, unknown> = {
      ticketId: { startsWith: `${eventId}_` },
    };
    if (dateFrom) {
      where.checkedInAt = { gte: new Date(dateFrom) };
    }

    const [checkIns, total] = await Promise.all([
      prisma.eventCheckIn.findMany({
        where,
        orderBy: { checkedInAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.eventCheckIn.count({ where }),
    ]);

    // Calculate stats
    const stats = {
      totalCheckIns: total,
      uniqueAttendees: new Set(checkIns.map((c: any) => c.customerEmail)).size,
      plusOnes: checkIns.reduce((sum: any, c: any) => sum + c.plusOnes, 0),
      totalAttendees: total + checkIns.reduce((sum: any, c: any) => sum + c.plusOnes, 0),
      byEntryMethod: {
        scan: checkIns.filter((c: any) => c.entryMethod === "scan").length,
        manual: checkIns.filter((c: any) => c.entryMethod === "manual").length,
        nfc: checkIns.filter((c: any) => c.entryMethod === "nfc").length,
      },
    };

    return NextResponse.json({
      checkIns,
      stats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + checkIns.length < total,
      },
    });
  } catch (error: unknown) {
    logger.error("[CHECK_IN_GET] Failed to fetch check-ins", { error });
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/check-in
 * Check in an attendee
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = checkInSchema.parse(body);

    // Check if already checked in
    const existing = await prisma.eventCheckIn.findFirst({
      where: {
        ticketId: validated.ticketId,
      },
    });

    if (existing) {
      return NextResponse.json({
        error: "Already checked in",
        checkedInAt: existing.checkedInAt,
        checkedInBy: existing.checkedInBy,
      }, { status: 409 });
    }

    const checkIn = await prisma.eventCheckIn.create({
      data: {
        ...validated,
        checkedInBy: "STAFF", // Should come from auth context
      },
    });

    // Update seat status if assigned
    if (validated.seatAssigned) {
      const eventId = validated.ticketId.split("_")[0];
      const seatMap = await prisma.eventSeatMap.findUnique({
        where: { eventId },
      });

      if (seatMap) {
        const seats = seatMap.seats as Array<{
          id: string;
          section: string;
          row: string;
          number: string;
          status: string;
          ticketTierId?: string;
        }>;

        const seat = seats.find(s => s.id === validated.seatAssigned);
        if (seat) {
          seat.status = "sold";
          await prisma.eventSeatMap.update({
            where: { eventId },
            data: { seats },
          });
        }
      }
    }

    logger.info("[CHECK_IN_POST] Attendee checked in", {
      ticketId: validated.ticketId,
      customer: validated.customerEmail,
    });

    return NextResponse.json({
      checkIn,
      message: `Checked in ${validated.customerName}${validated.plusOnes > 0 ? ` + ${validated.plusOnes} guest(s)` : ""}`,
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[CHECK_IN_POST] Check-in failed", { error });
    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/check-in/scan
 * Check in via QR code scan
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = scanSchema.parse(body);

    // Parse QR code (format: eventId_ticketId_customerEmail_hash)
    const parts = validated.qrCode.split("_");
    if (parts.length < 3) {
      return NextResponse.json(
        { error: "Invalid QR code format" },
        { status: 400 }
      );
    }

    const [eventId, ticketId, customerEmail] = parts;

    if (eventId !== validated.eventId) {
      return NextResponse.json(
        { error: "QR code does not match event" },
        { status: 400 }
      );
    }

    // Check if already checked in
    const existing = await prisma.eventCheckIn.findFirst({
      where: { ticketId },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: "Already checked in",
        checkedInAt: existing.checkedInAt,
        customerName: existing.customerName,
      }, { status: 409 });
    }

    // Create check-in
    const checkIn = await prisma.eventCheckIn.create({
      data: {
        orderId: `${eventId}_${ticketId}`,
        ticketId,
        customerName: "", // Would come from order lookup
        customerEmail,
        ticketTier: "General",
        entryMethod: validated.entryMethod,
        checkedInBy: "SCANNER",
      },
    });

    logger.info("[CHECK_IN_SCAN] QR scan successful", { ticketId });

    return NextResponse.json({
      success: true,
      checkIn,
      message: "Check-in successful",
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[CHECK_IN_SCAN] Scan failed", { error });
    return NextResponse.json(
      { error: "Failed to process scan" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/check-in
 * Undo a check-in (for corrections)
 */
export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID required" },
        { status: 400 }
      );
    }

    const checkIn = await prisma.eventCheckIn.findFirst({
      where: { ticketId },
    });

    if (!checkIn) {
      return NextResponse.json(
        { error: "Check-in not found" },
        { status: 404 }
      );
    }

    await prisma.eventCheckIn.delete({
      where: { id: checkIn.id },
    });

    // Reset seat status
    if (checkIn.seatAssigned) {
      const eventId = ticketId.split("_")[0];
      const seatMap = await prisma.eventSeatMap.findUnique({
        where: { eventId },
      });

      if (seatMap) {
        const seats = seatMap.seats as Array<{
          id: string;
          status: string;
        }>;
        const seat = seats.find(s => s.id === checkIn.seatAssigned);
        if (seat) {
          seat.status = "available";
          await prisma.eventSeatMap.update({
            where: { eventId },
            data: { seats },
          });
        }
      }
    }

    logger.info("[CHECK_IN_DELETE] Check-in reversed", { ticketId });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error("[CHECK_IN_DELETE] Failed to reverse check-in", { error });
    return NextResponse.json(
      { error: "Failed to reverse check-in" },
      { status: 500 }
    );
  }
}
