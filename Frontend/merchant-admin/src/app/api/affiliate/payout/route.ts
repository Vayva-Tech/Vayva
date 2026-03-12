import { logger, ErrorCategory } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { affiliateService } from "@vayva/affiliate";
import { prisma } from "@vayva/db";
import { z } from "zod";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

// Validation schema for payout initiation
const payoutSchema = z.object({
  affiliateId: z.string().uuid(),
  amount: z.number().int().min(1000), // Minimum 10 NGN (1000 kobo)
  method: z.enum(["bank_transfer", "wallet"]).default("bank_transfer"),
});

/**
 * POST /api/affiliate/payout
 * Initiate an affiliate payout
 */
export const POST = withVayvaAPI(PERMISSIONS.BILLING_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const body = await req.json();
    const data = payoutSchema.parse(body);

    // Get affiliate details and verify ownership
    const affiliate = await prisma.affiliate.findFirst({
      where: { id: data.affiliateId, storeId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Check minimum payout threshold
    const minimumPayout = Number(affiliate.minimumPayout) || 500000; // Default ₦5,000
    if (data.amount < minimumPayout) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Minimum payout amount is ₦${(minimumPayout / 100).toFixed(2)}` 
        },
        { status: 400 }
      );
    }

    // Check if bank details are configured for bank_transfer
    if (data.method === "bank_transfer" && !affiliate.paystackRecipientCode) {
      return NextResponse.json(
        { success: false, error: "Bank account not configured" },
        { status: 400 }
      );
    }

    // Determine if approval is required (amounts > ₦10,000 or custom threshold)
    const requiresApproval = data.amount > 1000000; // ₦10,000

    const result = await affiliateService.processPayout(
      data.affiliateId,
      data.amount,
      data.method,
      "system", // processedBy - should come from auth context
      { requiresApproval }
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payoutId: result.payoutId,
      transferCode: result.transferCode,
      status: requiresApproval ? "approval_required" : "processing",
      message: requiresApproval 
        ? "Payout submitted for approval" 
        : "Payout initiated successfully",
    });
  } catch (error) {
    logger.error("[Affiliate Payout] Error:", ErrorCategory.API, error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to process payout";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
});

/**
 * GET /api/affiliate/payout
 * Get affiliate payout history for the store
 */
export const GET = withVayvaAPI(PERMISSIONS.FINANCE_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const { searchParams } = new URL(req.url);
    const affiliateId = searchParams.get("affiliateId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      affiliate: { storeId },
    };

    if (affiliateId) {
      where.affiliateId = affiliateId;
    }

    if (status) {
      where.status = status;
    }

    const payouts = await prisma.affiliatePayout.findMany({
      where,
      orderBy: { initiatedAt: "desc" },
      take: 50,
      include: {
        affiliate: {
          select: { name: true, email: true, referralCode: true },
        },
      },
    });

    return NextResponse.json({ success: true, payouts });
  } catch (error) {
    logger.error("[Affiliate Payout GET] Error:", ErrorCategory.API, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
});
