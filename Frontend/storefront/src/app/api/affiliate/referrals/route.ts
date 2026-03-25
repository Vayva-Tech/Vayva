import { NextRequest, NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { getAffiliateSession } from "../_session";

export const GET = withStorefrontAPI(async (req: NextRequest, ctx: any) => {
  const { storeId, db } = ctx;
  const session = getAffiliateSession(req);
  if (!session || session.storeId !== storeId) {
    return NextResponse.json(
      { referrals: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const affiliate = await db.affiliate.findFirst({
    where: { id: session.affiliateId, storeId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!affiliate) {
    return NextResponse.json(
      { referrals: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const rows = await db.affiliateReferral.findMany({
    where: { affiliateId: affiliate.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(
    {
      referrals: rows.map((r: any) => ({
        id: r.id,
        customerName: r.customerId,
        customerEmail: r.customerId,
        orderAmount: Number(r.orderAmount || 0),
        commission: Number(r.commission || 0),
        status: String(r.status || "pending").toLowerCase(),
        createdAt: r.createdAt?.toISOString?.() ?? null,
        confirmedAt: r.convertedAt?.toISOString?.() ?? undefined,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});

