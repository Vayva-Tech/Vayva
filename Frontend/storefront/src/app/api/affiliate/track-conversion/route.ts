import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStorefrontAPI } from "@/lib/api-handler";
import { reportError } from "@/lib/error";
import { logger } from "@vayva/shared";

const trackConversionSchema = z.object({
  referralCode: z.string().min(1),
  orderId: z.string().uuid(),
  orderAmount: z.number().positive(),
  customerEmail: z.string().email(),
});

/**
 * POST /api/affiliate/track-conversion
 * Track an affiliate conversion when an order is successfully placed
 * This creates an affiliate referral record with commission
 */
export const POST = withStorefrontAPI(async (req: NextRequest, ctx: any) => {
  const { requestId, storeId, db } = ctx;

  try {
    const body = await req.json();
    const validated = trackConversionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { referralCode, orderId, orderAmount, customerEmail } = validated.data;

    // Find the affiliate by referral code
    const affiliate = await db.affiliate.findFirst({
      where: {
        referralCode,
        storeId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        commissionRate: true,
        commissionType: true,
        totalConversions: true,
        totalEarnings: true,
        pendingEarnings: true,
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid affiliate code" },
        { status: 400 }
      );
    }

    // Check if this order was already attributed
    const existingReferral = await db.affiliateReferral.findFirst({
      where: {
        orderId,
        affiliateId: affiliate.id,
      },
    });

    if (existingReferral) {
      return NextResponse.json({
        success: true,
        referralId: existingReferral.id,
        alreadyTracked: true,
      });
    }

    // Calculate commission
    const commissionRate = Number(affiliate.commissionRate) / 100;
    const commission = Math.round(orderAmount * commissionRate);

    // Create affiliate referral record
    const referral = await db.affiliateReferral.create({
      data: {
        affiliateId: affiliate.id,
        customerId: customerEmail, // Using email as customer identifier
        orderId,
        orderAmount,
        commission,
        status: "PENDING", // Will be confirmed when payment is successful
        referralSource: "storefront",
      },
    });

    // Create affiliate earning record
    await db.affiliateEarning.create({
      data: {
        affiliateId: affiliate.id,
        referralId: referral.id,
        orderId,
        amount: commission,
        type: "commission",
        description: `Commission for order ${orderId}`,
        status: "pending",
      },
    });

    // Update affiliate stats
    await db.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalConversions: { increment: 1 },
        totalEarnings: { increment: commission },
        pendingEarnings: { increment: commission },
      },
    });

    logger.info("[Affiliate] Conversion tracked", {
      requestId,
      affiliateId: affiliate.id,
      referralId: referral.id,
      storeId,
      orderId,
      orderAmount,
      commission,
      referralCode,
    });

    return NextResponse.json({
      success: true,
      referralId: referral.id,
      commission,
    });
  } catch (error) {
    reportError(error, {
      route: "POST /api/affiliate/track-conversion",
      storeId: ctx.storeId,
      requestId,
    });
    logger.error("[Affiliate] Failed to track conversion", { requestId, error });

    return NextResponse.json(
      { error: "Failed to track conversion" },
      { status: 500 }
    );
  }
});
