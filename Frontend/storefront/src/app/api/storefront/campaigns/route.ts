import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;
  const { searchParams } = new URL(request.url);

  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const featured = searchParams.get("featured") === "true";

  try {
    const campaigns = await db.donationCampaign.findMany({
      where: {
        storeId,
        status: "active",
        ...(featured ? { featured: true } : {}),
      },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        goal: true,
        raised: true,
        currency: true,
        startDate: true,
        endDate: true,
        status: true,
        bannerImage: true,
        featured: true,
      },
    });

    const formatted = campaigns.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description || null,
      goal: Number(c.goal),
      raised: Number(c.raised),
      currency: c.currency,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      bannerImage: c.bannerImage || null,
      featured: Boolean(c.featured),
    }));

    return NextResponse.json(
      { data: formatted, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to fetch storefront campaigns", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
      app: "storefront",
    });

    return NextResponse.json(
      { error: "Internal server error", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
