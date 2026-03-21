// @ts-nocheck
import { logger, ErrorCategory } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { affiliateService } from "@vayva/affiliate";
import { prisma } from "@vayva/db";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/affiliate/payout/approvals
 * Get pending payouts requiring approval
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: "storeId is required" },
        { status: 400 }
      );
    }

    const pendingApprovals = await affiliateService.getPendingApprovals(storeId);

    return NextResponse.json({ 
      success: true, 
      count: pendingApprovals.length,
      approvals: pendingApprovals 
    });
  } catch (error) {
    logger.error("[Affiliate Approvals] Error:", ErrorCategory.API, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending approvals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/affiliate/payout/approvals
 * Approve a pending payout and initiate Paystack transfer
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payoutId, approvedBy } = body;

    if (!payoutId || !approvedBy) {
      return NextResponse.json(
        { success: false, error: "payoutId and approvedBy are required" },
        { status: 400 }
      );
    }

    const result = await affiliateService.approvePayout(payoutId, approvedBy);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payoutId,
      transferCode: result.transferCode,
      message: "Payout approved and transfer initiated",
    });
  } catch (error) {
    logger.error("[Affiliate Approve Payout] Error:", ErrorCategory.API, error);
    const message = error instanceof Error ? error.message : "Failed to approve payout";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/affiliate/payout/approvals
 * Reject/cancel a pending payout
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { payoutId, rejectedBy, reason } = body;

    if (!payoutId || !rejectedBy) {
      return NextResponse.json(
        { success: false, error: "payoutId and rejectedBy are required" },
        { status: 400 }
      );
    }

    const storeId = req.headers.get("x-store-id") || "";
    const payout = await apiJson<{
        success: boolean;
        data?: any;
        error?: string;
      }>(`${process.env.BACKEND_API_URL}/api/affiliatepayout/id`, {
        headers: {
          "x-store-id": storeId,
        },
      });

    if (!payout) {
      return NextResponse.json(
        { success: false, error: "Payout not found" },
        { status: 404 }
      );
    }

    if (payout.status !== "APPROVAL_REQUIRED") {
      return NextResponse.json(
        { success: false, error: "Payout is not pending approval" },
        { status: 400 }
      );
    }

    // Update payout status
    await prisma.affiliatePayout.update({
      where: { id: payoutId },
      data: {
        status: "CANCELLED",
        failureReason: reason || "Rejected by admin",
        failedAt: new Date(),
      },
    });

    // Notify affiliate
    await affiliateService["notifyAffiliate"](payout.affiliateId, "payout_rejected", {
      payoutId,
      amount: payout.amount,
      reason: reason || "Payout request rejected",
    });

    return NextResponse.json({
      success: true,
      payoutId,
      message: "Payout rejected successfully",
    });
  } catch (error) {
    logger.error("[Affiliate Reject Payout] Error:", ErrorCategory.API, error);
    const message = error instanceof Error ? error.message : "Failed to reject payout";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
