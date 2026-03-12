import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStorefrontAPI } from "@/lib/api-handler";
import { reportError } from "@/lib/error";
import { logger } from "@vayva/shared";

const trackClickSchema = z.object({
  referralCode: z.string().min(1),
  source: z.string().optional(),
  landingPage: z.string().optional(),
});

/**
 * POST /api/affiliate/track-click
 * Track an affiliate link click from the storefront
 * This is called when a customer clicks an affiliate link (?ref=CODE)
 */
export const POST = withStorefrontAPI(async (req: NextRequest, ctx: any) => {
  const { requestId, storeId, db } = ctx;

  try {
    const body = await req.json();
    const validated = trackClickSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { referralCode, source, landingPage } = validated.data;

    // Find the affiliate by referral code
    const affiliate = await db.affiliate.findFirst({
      where: {
        referralCode,
        storeId,
        status: "ACTIVE",
      },
      select: { id: true, totalReferrals: true },
    });

    if (!affiliate) {
      // Silent fail - don't expose whether code exists
      return NextResponse.json({ success: true });
    }

    // Update affiliate stats
    await db.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalReferrals: { increment: 1 },
      },
    });

    logger.info("[Affiliate] Click tracked", {
      requestId,
      affiliateId: affiliate.id,
      storeId,
      referralCode,
      source,
      landingPage,
    });

    return NextResponse.json({
      success: true,
      affiliateId: affiliate.id,
    });
  } catch (error) {
    reportError(error, {
      route: "POST /api/affiliate/track-click",
      storeId: ctx.storeId,
      requestId,
    });
    logger.error("[Affiliate] Failed to track click", { requestId, error });

    // Silent fail - don't break user experience
    return NextResponse.json({ success: true });
  }
});
