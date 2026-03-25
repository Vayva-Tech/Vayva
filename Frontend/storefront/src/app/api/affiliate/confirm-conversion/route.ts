import { NextRequest, NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { reportError } from "@/lib/error";
import { logger } from "@vayva/shared";

const _confirmConversionSchema = {
  referralCode: "string",
  orderId: "string",
};

/**
 * POST /api/affiliate/confirm-conversion
 * Confirm an affiliate conversion after successful payment
 * This updates the referral status from PENDING to CONFIRMED
 */
export const POST = withStorefrontAPI(async (req: NextRequest, ctx: any) => {
  const { requestId, storeId, db } = ctx;

  try {
    const body = await req.json();
    const { referralCode, orderId } = body;

    if (!referralCode || !orderId) {
      return NextResponse.json(
        { error: "Missing referralCode or orderId" },
        { status: 400 }
      );
    }

    // Find the affiliate by referral code
    const affiliate = await db.affiliate.findFirst({
      where: {
        referralCode,
        storeId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid affiliate code" },
        { status: 400 }
      );
    }

    // Find the pending referral
    const referral = await db.affiliateReferral.findFirst({
      where: {
        affiliateId: affiliate.id,
        orderId,
        status: "PENDING",
      },
    });

    if (!referral) {
      return NextResponse.json(
        { error: "Referral not found or already confirmed" },
        { status: 404 }
      );
    }

    // Update referral status to confirmed
    await db.affiliateReferral.update({
      where: { id: referral.id },
      data: {
        status: "CONFIRMED",
        convertedAt: new Date(),
      },
    });

    // Update earning status to pending (ready for payout)
    await db.affiliateEarning.updateMany({
      where: {
        affiliateId: affiliate.id,
        orderId,
        status: "pending",
      },
      data: {
        status: "pending",
      },
    });

    logger.info("[Affiliate] Conversion confirmed", {
      requestId,
      affiliateId: affiliate.id,
      referralId: referral.id,
      storeId,
      orderId,
      commission: referral.commission,
    });

    return NextResponse.json({
      success: true,
      referralId: referral.id,
      status: "CONFIRMED",
      commission: referral.commission,
    });
  } catch (error) {
    reportError(error, {
      route: "POST /api/affiliate/confirm-conversion",
      storeId: ctx.storeId,
      requestId,
    });
    logger.error("[Affiliate] Failed to confirm conversion", { requestId, error });

    return NextResponse.json(
      { error: "Failed to confirm conversion" },
      { status: 500 }
    );
  }
});
