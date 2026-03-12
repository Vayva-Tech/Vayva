import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;
  const { searchParams } = new URL(request.url);

  const campaignId = searchParams.get("campaignId");
  if (!campaignId) {
    return NextResponse.json(
      { error: "Missing campaignId", requestId },
      { status: 400, headers: standardHeaders(requestId) },
    );
  }

  try {
    const campaign = await db.donationCampaign.findFirst({
      where: { id: campaignId, storeId, status: "active" },
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
        impactMetrics: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found", requestId },
        { status: 404, headers: standardHeaders(requestId) },
      );
    }

    const formatted = {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description || null,
      goal: Number(campaign.goal),
      raised: Number(campaign.raised),
      currency: campaign.currency,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status,
      bannerImage: campaign.bannerImage || null,
      featured: Boolean(campaign.featured),
      impactMetrics: campaign.impactMetrics || null,
    };

    return NextResponse.json(
      { data: formatted, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to fetch storefront campaign", {
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
