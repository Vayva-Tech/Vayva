import { NextRequest, NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { getAffiliateSession } from "../_session";

export const GET = withStorefrontAPI(async (req: NextRequest, ctx: any) => {
  const { storeId, storeSlug, db, requestId } = ctx;

  const session = getAffiliateSession(req);
  if (!session || session.storeId !== storeId) {
    return NextResponse.json(
      { isActive: false },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  const affiliate = await db.affiliate.findFirst({
    where: { id: session.affiliateId, storeId },
  });

  if (!affiliate || affiliate.status !== "ACTIVE") {
    return NextResponse.json(
      {
        isActive: false,
        joinedAt: affiliate?.createdAt?.toISOString?.() ?? null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const root =
    process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN ||
    process.env.STOREFRONT_ROOT_DOMAIN ||
    "vayva.ng";
  const referralLink = `https://${storeSlug}.${root}/?ref=${encodeURIComponent(
    affiliate.referralCode,
  )}`;

  // Lightweight stats for the existing dashboard UI.
  return NextResponse.json(
    {
      totalReferrals: Number(affiliate.totalReferrals || 0),
      successfulReferrals: Number(affiliate.totalConversions || 0),
      pendingReferrals: Math.max(
        0,
        Number(affiliate.totalReferrals || 0) - Number(affiliate.totalConversions || 0),
      ),
      totalEarnings: Number(affiliate.totalEarnings || 0),
      availableBalance: Number(affiliate.pendingEarnings || 0),
      conversionRate:
        Number(affiliate.totalReferrals || 0) > 0
          ? (Number(affiliate.totalConversions || 0) / Number(affiliate.totalReferrals || 0)) * 100
          : 0,
      avgOrderValue: 0,
      referralCode: affiliate.referralCode,
      referralLink,
      commissionRate: Number(affiliate.commissionRate || 0),
      commissionType: (affiliate.commissionType || "percentage") as
        | "percentage"
        | "fixed",
      isActive: true,
      joinedAt: affiliate.createdAt.toISOString(),
      requestId,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});

