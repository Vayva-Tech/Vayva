import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const availabilitySchema = z.object({
  serviceId: z.string(),
  staffId: z.string(),
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^\d{2}:\d{2}$/), // "09:00"
  endTime: z.string().regex(/^\d{2}:\d{2}$/), // "17:00"
  slotDuration: z.number().int().min(15).max(240), // minutes
  bufferMinutes: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

const availabilityUpdateSchema = availabilitySchema.partial().omit({ serviceId: true, staffId: true, dayOfWeek: true });

const exceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  isAvailable: z.boolean(),
  reason: z.string().optional(),
});

/**
 * GET /api/services/availability?serviceId=xxx&staffId=xxx
 * Get staff availability schedules
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");
    const dayOfWeek = searchParams.get("dayOfWeek");

    const where: Record<string, unknown> = {};
    
    if (serviceId) where.serviceId = serviceId;
    if (staffId) where.staffId = staffId;
    if (dayOfWeek !== null) where.dayOfWeek = parseInt(dayOfWeek, 10);

    const availability = await prisma.serviceAvailability.findMany({
      where,
      orderBy: [
        { staffId: "asc" },
        { dayOfWeek: "asc" },
      ],
    });

    // Group by staff for easier consumption
    const groupedByStaff = availability.reduce((acc: Record<string, unknown[]>, curr: { staffId: string }) => {
      if (!acc[curr.staffId]) acc[curr.staffId] = [];
      acc[curr.staffId].push(curr);
      return acc;
    }, {});

    return NextResponse.json({
      availability,
      groupedByStaff,
      summary: {
        total: availability.length,
        active: availability.filter((a: { isActive: boolean }) => a.isActive).length,
        staffCount: Object.keys(groupedByStaff).length,
      },
    });
  } catch (error) {
    logger.error("[STAFF_AVAILABILITY_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services/availability
 * Create or update staff availability
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = availabilitySchema.parse(body);

    // Check for existing availability (unique constraint: serviceId + staffId + dayOfWeek)
    const existing = await prisma.serviceAvailability.findUnique({
      where: {
        serviceId_staffId_dayOfWeek: {
          serviceId: validated.serviceId,
          staffId: validated.staffId,
          dayOfWeek: validated.dayOfWeek,
        },
      },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.serviceAvailability.update({
        where: {
          serviceId_staffId_dayOfWeek: {
            serviceId: validated.serviceId,
            staffId: validated.staffId,
            dayOfWeek: validated.dayOfWeek,
          },
        },
        data: {
          startTime: validated.startTime,
          endTime: validated.endTime,
          slotDuration: validated.slotDuration,
          bufferMinutes: validated.bufferMinutes,
          isActive: validated.isActive,
        },
      });

      logger.info("[STAFF_AVAILABILITY_POST] Updated", {
        availabilityId: updated.id,
        serviceId: validated.serviceId,
        staffId: validated.staffId,
        dayOfWeek: validated.dayOfWeek,
      });

      return NextResponse.json({ availability: updated, created: false });
    }

    // Create new
    const created = await prisma.serviceAvailability.create({
      data: validated,
    });

    logger.info("[STAFF_AVAILABILITY_POST] Created", {
      availabilityId: created.id,
      serviceId: validated.serviceId,
      staffId: validated.staffId,
      dayOfWeek: validated.dayOfWeek,
    });

    return NextResponse.json({ availability: created, created: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[STAFF_AVAILABILITY_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to create availability" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/services/availability?id=xxx
 * Update availability details
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Availability ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = availabilityUpdateSchema.parse(body);

    const updated = await prisma.serviceAvailability.update({
      where: { id },
      data: validated,
    });

    logger.info("[STAFF_AVAILABILITY_PATCH] Updated", { availabilityId: id });

    return NextResponse.json({ availability: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[STAFF_AVAILABILITY_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services/availability/exceptions?id=xxx
 * Add an exception to availability
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Availability ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = exceptionSchema.parse(body);

    // Get current exceptions
    const availability = await prisma.serviceAvailability.findUnique({
      where: { id },
    });

    if (!availability) {
      return NextResponse.json(
        { error: "Availability not found" },
        { status: 404 }
      );
    }

    // Add new exception
    const exceptions = (availability.exceptions as Array<{ date: string; isAvailable: boolean; reason?: string }>) || [];
    exceptions.push({
      date: validated.date,
      isAvailable: validated.isAvailable,
      reason: validated.reason,
    });

    const updated = await prisma.serviceAvailability.update({
      where: { id },
      data: { exceptions },
    });

    logger.info("[STAFF_AVAILABILITY_EXCEPTION] Added", {
      availabilityId: id,
      date: validated.date,
      isAvailable: validated.isAvailable,
    });

    return NextResponse.json({ availability: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[STAFF_AVAILABILITY_EXCEPTION] Failed", { error });
    return NextResponse.json(
      { error: "Failed to add exception" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/availability?id=xxx
 * Delete availability schedule
 */
export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Availability ID required" },
        { status: 400 }
      );
    }

    await prisma.serviceAvailability.delete({
      where: { id },
    });

    logger.info("[STAFF_AVAILABILITY_DELETE] Deleted", { availabilityId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[STAFF_AVAILABILITY_DELETE] Failed", { error });
    return NextResponse.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    );
  }
}
