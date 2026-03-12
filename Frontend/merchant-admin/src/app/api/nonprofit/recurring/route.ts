import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const recurringDonationSchema = z.object({
  donorId: z.string(),
  amount: z.number().positive(),
  frequency: z.enum(["weekly", "monthly", "quarterly", "annually"]),
  startDate: z.string().datetime(),
  campaignId: z.string().optional(),
  paymentMethod: z.enum(["card", "bank", "wallet"]).default("card"),
});

const statusUpdateSchema = z.object({
  status: z.enum(["active", "paused", "cancelled"]),
});

/**
 * GET /api/nonprofit/recurring?storeId=xxx&status=xxx
 * List recurring donations
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    const donorId = searchParams.get("donorId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Get donor IDs for this store
    const donors = await prisma.donor?.findMany({
      where: { storeId },
      select: { id: true },
    });

    const donorIds = donors.map((d: { id: string }) => d.id);

    const where: Record<string, unknown> = {
      donorId: { in: donorIds },
    };
    
    if (status) (where as any).status = status;
    if (donorId) where.donorId = donorId;

    const recurring = await prisma.recurringDonation?.findMany({
      where,
      orderBy: { nextChargeDate: "asc" },
    });

    // Calculate stats
    const stats = {
      total: recurring.length,
      active: recurring.filter((r: any) => r.status === "active").length,
      paused: recurring.filter((r: any) => r.status === "paused").length,
      cancelled: recurring.filter((r: any) => r.status === "cancelled").length,
      monthlyRevenue: recurring
        .filter((r: any) => r.status === "active" && r.frequency === "monthly")
        .reduce((sum: number, r: any) => sum + Number(r.amount), 0),
      totalCharged: recurring.reduce((sum: number, r: any) => sum + Number(r.totalCharged), 0),
    };

    return NextResponse.json({ recurring, stats });
  } catch (error: unknown) {
    logger.error("[RECURRING_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch recurring donations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nonprofit/recurring
 * Create a new recurring donation
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = recurringDonationSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Verify donor belongs to this store
    const donor = await prisma.donor?.findFirst({
      where: { id: validated.donorId, storeId },
    });

    if (!donor) {
      return NextResponse.json(
        { error: "Donor not found" },
        { status: 404 }
      );
    }

    // Calculate next charge date
    const startDate = new Date(validated.startDate);
    const nextChargeDate = new Date(startDate);

    const recurring = await prisma.recurringDonation?.create({
      data: {
        storeId,
        donorId: validated.donorId,
        amount: validated.amount,
        frequency: validated.frequency,
        startDate,
        nextChargeDate,
        status: "active",
        campaignId: validated.campaignId,
        paymentMethod: validated.paymentMethod,
        totalCharged: 0,
        chargeCount: 0,
        failureCount: 0,
      },
    });

    // Update donor's recurring status
    await prisma.donor?.update({
      where: { id: validated.donorId },
      data: {
        isRecurringDonor: true,
        recurringAmount: validated.amount,
      },
    });

    logger.info("[RECURRING_POST] Created", {
      recurringId: recurring.id,
      storeId,
      donorId: validated.donorId,
      amount: validated.amount,
      frequency: validated.frequency,
    });

    return NextResponse.json({ recurring }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[RECURRING_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to create recurring donation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/nonprofit/recurring?id=xxx
 * Update recurring donation status
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Recurring donation ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = statusUpdateSchema.parse(body);

    const recurring = await prisma.recurringDonation?.update({
      where: { id },
      data: {
        status: (validated as any).status,
        updatedAt: new Date(),
      },
    });

    logger.info("[RECURRING_PATCH] Updated", {
      recurringId: id,
      status: (validated as any).status,
    });

    return NextResponse.json({ recurring });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[RECURRING_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update recurring donation" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nonprofit/recurring/record-charge?id=xxx
 * Record a successful charge for a recurring donation
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Recurring donation ID required" },
        { status: 400 }
      );
    }

    const recurring = await prisma.recurringDonation?.findUnique({
      where: { id },
    });

    if (!recurring) {
      return NextResponse.json(
        { error: "Recurring donation not found" },
        { status: 404 }
      );
    }

    // Calculate next charge date based on frequency
    const nextChargeDate = new Date();
    switch (recurring.frequency) {
      case "weekly":
        nextChargeDate.setDate(nextChargeDate.getDate() + 7);
        break;
      case "monthly":
        nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);
        break;
      case "quarterly":
        nextChargeDate.setMonth(nextChargeDate.getMonth() + 3);
        break;
      case "annually":
        nextChargeDate.setFullYear(nextChargeDate.getFullYear() + 1);
        break;
    }

    const updated = await prisma.recurringDonation?.update({
      where: { id },
      data: {
        lastChargedAt: new Date(),
        nextChargeDate,
        totalCharged: { increment: recurring.amount },
        chargeCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    // Update donor stats
    await prisma.donor?.update({
      where: { id: recurring.donorId },
      data: {
        totalDonated: { increment: recurring.amount },
        donationCount: { increment: 1 },
        lastDonation: new Date(),
      },
    });

    // Update campaign if linked
    if (recurring.campaignId) {
      await prisma.fundraisingCampaign?.update({
        where: { id: recurring.campaignId },
        data: {
          raisedAmount: { increment: recurring.amount },
          updatedAt: new Date(),
        },
      });
    }

    logger.info("[RECURRING_CHARGE] Recorded", {
      recurringId: id,
      amount: recurring.amount,
      nextChargeDate,
    });

    return NextResponse.json({ recurring: updated });
  } catch (error: unknown) {
    logger.error("[RECURRING_CHARGE] Failed", { error });
    return NextResponse.json(
      { error: "Failed to record charge" },
      { status: 500 }
    );
  }
}
