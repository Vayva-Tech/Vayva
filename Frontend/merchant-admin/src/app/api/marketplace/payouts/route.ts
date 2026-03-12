import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const payoutCalculationSchema = z.object({
  vendorId: z.string(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

const payoutStatusSchema = z.object({
  status: z.enum(["pending", "processing", "paid", "failed"]),
  paymentRef: z.string().optional(),
});

/**
 * GET /api/marketplace/payouts?storeId=xxx&vendorId=xxx&status=xxx
 * List vendor payouts
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Get vendors for this store first
    const vendors = await prisma.vendor?.findMany({
      where: { storeId },
      select: { id: true },
    });

    const vendorIds = vendors.map((v: { id: string }) => v.id);
    
    if (vendorId && !vendorIds.includes(vendorId)) {
      return NextResponse.json(
        { error: "Vendor not found in this store" },
        { status: 404 }
      );
    }

    const where: Record<string, unknown> = {
      vendorId: vendorId || { in: vendorIds },
    };
    
    if (status) (where as any).status = status;

    const payouts = await prisma.vendorPayout?.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const stats = {
      totalPayouts: payouts.length,
      pending: payouts.filter((p: { status: string }) => (p as any).status === "pending").length,
      processing: payouts.filter((p: { status: string }) => (p as any).status === "processing").length,
      paid: payouts.filter((p: { status: string }) => (p as any).status === "paid").length,
      failed: payouts.filter((p: { status: string }) => (p as any).status === "failed").length,
      totalSales: payouts.reduce((sum: number, p: any) => sum + Number(p.totalSales || 0), 0),
      totalCommission: payouts.reduce((sum: number, p: any) => sum + Number(p.commission || 0), 0),
      totalNetPayout: payouts.reduce((sum: number, p: any) => sum + Number(p.netPayout || 0), 0),
    };

    return NextResponse.json({ payouts, stats });
  } catch (error: unknown) {
    logger.error("[PAYOUTS_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/payouts/calculate
 * Calculate payout for a vendor period
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = payoutCalculationSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Verify vendor belongs to store
    const vendor = await prisma.vendor?.findFirst({
      where: { id: validated.vendorId, storeId },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    const periodStart = new Date(validated.periodStart);
    const periodEnd = new Date(validated.periodEnd);

    // Get marketplace order items for this period
    const orderItems = await prisma.marketplaceOrderItem?.findMany({
      where: {
        vendorId: validated.vendorId,
        status: { in: ["delivered", "shipped"] },
        deliveredAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    // Calculate totals
    const totalSales = orderItems.reduce((sum: number, item: any) => sum + Number(item.total || 0), 0);
    const totalCommission = orderItems.reduce((sum: number, item: any) => sum + Number(item.commission || 0), 0);
    const totalVendorPayout = orderItems.reduce((sum: number, item: any) => sum + Number(item.vendorPayout || 0), 0);

    // Calculate fees (platform fee, transaction fee, etc.)
    const platformFeeRate = 0.02; // 2% platform fee
    const transactionFeeRate = 0.015; // 1.5% transaction fee
    
    const platformFees = Number(totalSales) * platformFeeRate;
    const transactionFees = Number(totalSales) * transactionFeeRate;
    const totalFees = platformFees + transactionFees;

    const netPayout = Number(totalVendorPayout) - Number(totalFees);

    // Check for existing payout
    const existingPayout = await prisma.vendorPayout?.findFirst({
      where: {
        vendorId: validated.vendorId,
        periodStart,
        periodEnd,
      },
    });

    if (existingPayout) {
      return NextResponse.json({
        message: "Payout already calculated for this period",
        existing: true,
        payout: existingPayout,
        calculation: {
          period: { start: periodStart, end: periodEnd },
          orderCount: orderItems.length,
          totalSales,
          totalCommission,
          fees: totalFees,
          netPayout,
        },
      });
    }

    // Create the payout record
    const payout = await prisma.vendorPayout?.create({
      data: {
        vendorId: validated.vendorId,
        periodStart,
        periodEnd,
        totalSales: Number(totalSales),
        commission: Number(totalCommission),
        fees: totalFees,
        netPayout,
        orderCount: orderItems.length,
        status: "pending",
        paymentMethod: "bank_transfer", // Default, can be configured per vendor
      },
    });

    logger.info("[PAYOUTS_CALCULATE] Created", {
      payoutId: payout.id,
      vendorId: validated.vendorId,
      periodStart,
      periodEnd,
      netPayout,
    });

    return NextResponse.json({
      payout,
      calculation: {
        period: { start: periodStart, end: periodEnd },
        orderCount: orderItems.length,
        totalSales,
        totalCommission,
        fees: totalFees,
        netPayout,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[PAYOUTS_CALCULATE] Failed", { error });
    return NextResponse.json(
      { error: "Failed to calculate payout" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/marketplace/payouts?id=xxx
 * Update payout status
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Payout ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = payoutStatusSchema.parse(body);

    const updateData: Record<string, unknown> = {
      status: (validated as any).status,
    };

    if ((validated as any).status === "paid") {
      updateData.paidAt = new Date();
    }

    if (validated.paymentRef) {
      updateData.paymentRef = validated.paymentRef;
    }

    const payout = await prisma.vendorPayout?.update({
      where: { id },
      data: updateData,
    });

    logger.info("[PAYOUTS_PATCH] Updated", {
      payoutId: id,
      status: (validated as any).status,
      paymentRef: validated.paymentRef,
    });

    return NextResponse.json({ payout });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[PAYOUTS_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update payout" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplace/payouts/summary?storeId=xxx
 * Get payout summary/dashboard data
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Get vendors for this store
    const vendors = await prisma.vendor?.findMany({
      where: { storeId },
      select: { id: true },
    });

    const vendorIds = vendors.map((v: { id: string }) => v.id);

    // Get all payouts
    const payouts = await prisma.vendorPayout?.findMany({
      where: { vendorId: { in: vendorIds } },
    });

    // Calculate period-based summaries
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthPayouts = payouts.filter(
      (p: { periodStart: Date }) => new Date(p.periodStart) >= thisMonthStart
    );
    const lastMonthPayouts = payouts.filter(
      (p: { periodStart: Date; periodEnd: Date }) => 
        new Date(p.periodStart) >= lastMonthStart && 
        new Date(p.periodEnd) <= lastMonthEnd
    );

    const summary = {
      thisMonth: {
        payouts: thisMonthPayouts.length,
        totalSales: thisMonthPayouts.reduce((sum: number, p: any) => sum + Number(p.totalSales || 0), 0),
        totalCommission: thisMonthPayouts.reduce((sum: number, p: any) => sum + Number(p.commission || 0), 0),
        totalNetPayout: thisMonthPayouts.reduce((sum: number, p: any) => sum + Number(p.netPayout || 0), 0),
      },
      lastMonth: {
        payouts: lastMonthPayouts.length,
        totalSales: lastMonthPayouts.reduce((sum: number, p: any) => sum + Number(p.totalSales || 0), 0),
        totalCommission: lastMonthPayouts.reduce((sum: number, p: any) => sum + Number(p.commission || 0), 0),
        totalNetPayout: lastMonthPayouts.reduce((sum: number, p: any) => sum + Number(p.netPayout || 0), 0),
      },
      pending: {
        count: payouts.filter((p: { status: string }) => (p as any).status === "pending").length,
        amount: payouts
          .filter((p: any) => (p as any).status === "pending")
          .reduce((sum: number, p: any) => sum + Number(p.netPayout || 0), 0),
      },
      processing: {
        count: payouts.filter((p: { status: string }) => (p as any).status === "processing").length,
        amount: payouts
          .filter((p: any) => (p as any).status === "processing")
          .reduce((sum: number, p: any) => sum + Number(p.netPayout || 0), 0),
      },
    };

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    logger.error("[PAYOUTS_SUMMARY] Failed", { error });
    return NextResponse.json(
      { error: "Failed to get payout summary" },
      { status: 500 }
    );
  }
}
