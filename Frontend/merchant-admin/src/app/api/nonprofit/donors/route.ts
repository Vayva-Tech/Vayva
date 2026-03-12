import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const donorSchema = z.object({
  customerId: z.string(),
  donorType: z.enum(["individual", "corporate", "foundation"]).default("individual"),
  preferredCause: z.string().optional(),
  communicationPreference: z.enum(["email", "phone", "mail"]).default("email"),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).default([]),
});

const donorUpdateSchema = donorSchema.partial();

/**
 * GET /api/nonprofit/donors?storeId=xxx&donorType=xxx&tags=xxx
 * List donors for a store
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const donorType = searchParams.get("donorType");
    const tags = searchParams.get("tags");
    const minDonated = searchParams.get("minDonated");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    
    if (donorType) where.donorType = donorType;
    if (tags) where.tags = { has: tags };
    if (minDonated) where.totalDonated = { gte: parseFloat(minDonated) };

    const donors = await prisma.donor?.findMany({
      where,
      orderBy: { totalDonated: "desc" },
    });

    // Calculate stats
    const stats = {
      total: donors.length,
      byType: {
        individual: donors.filter((d: { donorType: string }) => d.donorType === "individual").length,
        corporate: donors.filter((d: { donorType: string }) => d.donorType === "corporate").length,
        foundation: donors.filter((d: { donorType: string }) => d.donorType === "foundation").length,
      },
      totalDonated: donors.reduce((sum: number, d: { totalDonated: { toNumber: () => number } }) => sum + d.totalDonated.toNumber(), 0),
      avgDonation: donors.length > 0
        ? donors.reduce((sum: number, d: { totalDonated: { toNumber: () => number } }) => sum + d.totalDonated.toNumber(), 0) / donors.length
        : 0,
      recurringDonors: donors.filter((d: { isRecurringDonor: boolean }) => d.isRecurringDonor).length,
    };

    return NextResponse.json({ donors, stats });
  } catch (error: unknown) {
    logger.error("[DONORS_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch donors" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nonprofit/donors
 * Create or update a donor
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = donorSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Check if donor already exists for this customer
    const existing = await prisma.donor?.findFirst({
      where: {
        storeId,
        customerId: validated.customerId,
      },
    });

    if (existing) {
      // Update existing donor
      const updated = await prisma.donor?.update({
        where: { id: existing.id },
        data: {
          ...validated,
          updatedAt: new Date(),
        },
      });

      logger.info("[DONORS_POST] Updated", {
        donorId: updated.id,
        storeId,
        customerId: validated.customerId,
      });

      return NextResponse.json({ donor: updated, created: false });
    }

    // Create new donor
    const donor = await prisma.donor?.create({
      data: {
        storeId,
        ...validated,
        totalDonated: 0,
        donationCount: 0,
        isRecurringDonor: false,
      },
    });

    logger.info("[DONORS_POST] Created", {
      donorId: donor.id,
      storeId,
      customerId: validated.customerId,
    });

    return NextResponse.json({ donor, created: true }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[DONORS_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to create donor" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/nonprofit/donors?id=xxx
 * Update donor details
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Donor ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = donorUpdateSchema.parse(body);

    const donor = await prisma.donor?.update({
      where: { id },
      data: {
        ...validated,
        updatedAt: new Date(),
      },
    });

    logger.info("[DONORS_PATCH] Updated", { donorId: id });

    return NextResponse.json({ donor });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[DONORS_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update donor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nonprofit/donors/record-donation?id=xxx
 * Record a donation and update donor stats
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Donor ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { amount, campaignId } = z.object({
      amount: z.number().positive(),
      campaignId: z.string().optional(),
    }).parse(body);

    const donor = await prisma.donor?.findUnique({
      where: { id },
    });

    if (!donor) {
      return NextResponse.json(
        { error: "Donor not found" },
        { status: 404 }
      );
    }

    // Update donor stats
    const updatedDonor = await prisma.donor?.update({
      where: { id },
      data: {
        totalDonated: { increment: amount },
        donationCount: { increment: 1 },
        lastDonation: new Date(),
        firstDonation: donor.firstDonation || new Date(),
        updatedAt: new Date(),
      },
    });

    // Update campaign if provided
    if (campaignId) {
      await prisma.fundraisingCampaign?.update({
        where: { id: campaignId },
        data: {
          raisedAmount: { increment: amount },
          donorCount: { increment: 1 },
          updatedAt: new Date(),
        },
      });
    }

    logger.info("[DONORS_DONATION] Recorded", {
      donorId: id,
      amount,
      campaignId,
    });

    return NextResponse.json({
      donor: updatedDonor,
      donation: {
        amount,
        campaignId,
        recordedAt: new Date(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[DONORS_DONATION] Failed", { error });
    return NextResponse.json(
      { error: "Failed to record donation" },
      { status: 500 }
    );
  }
}
