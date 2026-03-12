import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

const createTestDriveSchema = z.object({
  vehicleId: z.string().uuid(),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10).max(20),
  preferredDate: z.string().datetime(),
  alternateDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
  salesPersonId: z.string().uuid().optional(),
  licenseVerified: z.boolean().optional(),
  insuranceVerified: z.boolean().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/vehicles/test-drives
 * List test drive appointments with filters
 */
export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const vehicleId = searchParams.get("vehicleId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: Record<string, unknown> = { storeId };
    if (status) (where as any).status = status;
    if (vehicleId) where.vehicleId = vehicleId;
    if (dateFrom || dateTo) {
      where.preferredDate = {};
      if (dateFrom) (where.preferredDate as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.preferredDate as Record<string, Date>).lte = new Date(dateTo);
    }

    const [testDrives, total] = await Promise.all([
      prisma.vehicleTestDrive?.findMany({
        where,
        orderBy: { preferredDate: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.vehicleTestDrive?.count({ where }),
    ]);

    return NextResponse.json({
      testDrives,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + testDrives.length < total,
      },
    });
  } catch (error: unknown) {
    logger.error("[TEST_DRIVES_GET] Failed to fetch test drives", { error, storeId });
    return NextResponse.json(
      { error: "Failed to fetch test drives" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/vehicles/test-drives
 * Schedule a new test drive
 */
export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const body = await req.json();
    const validated = createTestDriveSchema.parse(body);

    // Check for conflicts (same vehicle, same time slot)
    const twoHoursBefore = new Date(new Date(validated.preferredDate).getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(new Date(validated.preferredDate).getTime() + 2 * 60 * 60 * 1000);

    const conflicts = await prisma.vehicleTestDrive?.count({
      where: {
        vehicleId: validated.vehicleId,
        status: { notIn: ["cancelled", "no_show"] },
        preferredDate: {
          gte: twoHoursBefore,
          lte: twoHoursAfter,
        },
      },
    });

    if (conflicts > 0) {
      return NextResponse.json(
        { error: "Time slot conflict - vehicle already booked" },
        { status: 409 }
      );
    }

    const testDrive = await prisma.vehicleTestDrive?.create({
      data: {
        ...validated,
        storeId,
        preferredDate: new Date(validated.preferredDate),
        alternateDate: validated.alternateDate ? new Date(validated.alternateDate) : null,
      },
    });

    logger.info("[TEST_DRIVES_POST] Test drive scheduled", {
      testDriveId: testDrive.id,
      storeId,
      vehicleId: validated.vehicleId,
    });

    return NextResponse.json({ testDrive }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[TEST_DRIVES_POST] Failed to schedule test drive", { error, storeId });
    return NextResponse.json(
      { error: "Failed to schedule test drive" },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/vehicles/test-drives?id=xxx
 * Update test drive status
 */
export const PATCH = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Test drive ID required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = updateStatusSchema.parse(body);

    const testDrive = await prisma.vehicleTestDrive?.findFirst({
      where: { id, storeId },
    });

    if (!testDrive) {
      return NextResponse.json(
        { error: "Test drive not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.vehicleTestDrive?.update({
      where: { id },
      data: {
        ...validated,
        updatedAt: new Date(),
      },
    });

    logger.info("[TEST_DRIVES_PATCH] Test drive updated", {
      testDriveId: id,
      storeId,
      status: (validated as any).status,
    });

    return NextResponse.json({ testDrive: updated });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[TEST_DRIVES_PATCH] Failed to update test drive", { error, storeId });
    return NextResponse.json(
      { error: "Failed to update test drive" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/vehicles/test-drives?id=xxx
 * Cancel a test drive
 */
export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Test drive ID required" },
        { status: 400 }
      );
    }

    const testDrive = await prisma.vehicleTestDrive?.findFirst({
      where: { id, storeId },
    });

    if (!testDrive) {
      return NextResponse.json(
        { error: "Test drive not found" },
        { status: 404 }
      );
    }

    await prisma.vehicleTestDrive?.update({
      where: { id },
      data: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    });

    logger.info("[TEST_DRIVES_DELETE] Test drive cancelled", { testDriveId: id, storeId });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error("[TEST_DRIVES_DELETE] Failed to cancel test drive", { error, storeId });
    return NextResponse.json(
      { error: "Failed to cancel test drive" },
      { status: 500 }
    );
  }
});
