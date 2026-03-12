import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const accommodationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["room", "suite", "villa", "apartment"]),
  description: z.string().min(10).max(2000),
  maxGuests: z.number().int().min(1).max(20),
  bedConfiguration: z.string(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  basePrice: z.number().positive(),
  cleaningFee: z.number().min(0).default(0),
  serviceFee: z.number().min(0).default(0),
});

/**
 * GET /api/stays/accommodations
 * List accommodations for a store
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const isActive = searchParams.get("isActive");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    if (isActive !== null) where.isActive = isActive === "true";

    const accommodations = await prisma.accommodation.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ accommodations });
  } catch (error) {
    logger.error("[ACCOMMODATIONS_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch accommodations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stays/accommodations
 * Create new accommodation
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = accommodationSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const accommodation = await prisma.accommodation.create({
      data: {
        ...validated,
        storeId,
      },
    });

    // Create default availability calendar (90 days ahead)
    const availabilityData = [];
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      availabilityData.push({
        accommodationId: accommodation.id,
        date,
        isAvailable: true,
      });
    }

    await prisma.availabilityCalendar.createMany({
      data: availabilityData,
      skipDuplicates: true,
    });

    logger.info("[ACCOMMODATIONS_POST] Created", {
      accommodationId: accommodation.id,
      storeId,
    });

    return NextResponse.json({ accommodation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[ACCOMMODATIONS_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to create accommodation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stays/accommodations?id=xxx
 * Update accommodation
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Accommodation ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = accommodationSchema.partial().parse(body);

    const accommodation = await prisma.accommodation.update({
      where: { id },
      data: {
        ...validated,
        updatedAt: new Date(),
      },
    });

    logger.info("[ACCOMMODATIONS_PATCH] Updated", { accommodationId: id });

    return NextResponse.json({ accommodation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[ACCOMMODATIONS_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update accommodation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stays/accommodations?id=xxx
 * Deactivate accommodation
 */
export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Accommodation ID required" },
        { status: 400 }
      );
    }

    await prisma.accommodation.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });

    logger.info("[ACCOMMODATIONS_DELETE] Deactivated", { accommodationId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[ACCOMMODATIONS_DELETE] Failed", { error });
    return NextResponse.json(
      { error: "Failed to deactivate accommodation" },
      { status: 500 }
    );
  }
}
