import { logger, ErrorCategory } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { affiliateService } from "@vayva/affiliate";
import { prisma } from "@vayva/db";
/**
 * GET /api/affiliate/payout/approvals
 * Get pending payouts requiring approval
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
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
    const auth = await buildBackendAuthHeaders(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await req.json().catch(() => ({}));
    const record =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const payoutId =
      typeof record.payoutId === "string" ? record.payoutId : undefined;
    const approvedBy =
      typeof record.approvedBy === "string" ? record.approvedBy : undefined;

    if (!payoutId || !approvedBy) {
      return NextResponse.json(
        { success: false, error: "payoutId and approvedBy are required" },
        { status: 400 }
      );
    }

    const result = await affiliateService.approvePayout(payoutId, approvedBy, storeId);

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
    const auth = await buildBackendAuthHeaders(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json().catch(() => ({}));
    const record =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const payoutId =
      typeof record.payoutId === "string" ? record.payoutId : undefined;
    const rejectedBy =
      typeof record.rejectedBy === "string" ? record.rejectedBy : undefined;
    const reason =
      typeof record.reason === "string" ? record.reason : undefined;

    if (!payoutId || !rejectedBy) {
      return NextResponse.json(
        { success: false, error: "payoutId and rejectedBy are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.affiliatePayout.findFirst({
      where: { id: payoutId, storeId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Payout not found" },
        { status: 404 }
      );
    }

    if (existing.status !== "APPROVAL_REQUIRED") {
      return NextResponse.json(
        { success: false, error: "Payout is not pending approval" },
        { status: 400 }
      );
    }

    await prisma.affiliatePayout.updateMany({
      where: { id: payoutId, storeId, status: "APPROVAL_REQUIRED" },
      data: {
        status: "CANCELLED",
        failureReason: reason || "Rejected by admin",
        failedAt: new Date(),
      },
    });

    // Notify affiliate
    await affiliateService.notifyAffiliate(existing.affiliateId, "payout_rejected", {
      payoutId,
      amount: existing.amount,
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
