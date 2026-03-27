import { NextRequest } from "next/server";
import { prisma, logger } from "@vayva/shared";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (campaignId) {
      // Get single campaign with donations
      const campaign = await prisma.donationCampaign.findUnique({
        where: { id: campaignId },
        include: {
          donations: {
            include: {
              donor: true,
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { donations: true },
          },
        },
      });

      return Response.json({ data: [campaign] });
    }

    // Get all campaigns
    const campaigns = await prisma.donationCampaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { donations: true },
        },
      },
    });

    return Response.json({ data: campaigns });
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[CAMPAIGNS_GET_ERROR]", { error: _errMsg });
    return Response.json({ error: _errMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, goal, currency, startDate, endDate, category, impactMetrics } = body;

    const campaign = await prisma.donationCampaign.create({
      data: {
        title,
        description,
        goal: parseFloat(goal),
        currency: currency || "USD",
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        category: category || "general",
        status: "draft",
        impactMetrics: impactMetrics || {},
      },
    });

    return Response.json({ data: campaign });
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[CAMPAIGN_CREATE_ERROR]", { error: _errMsg });
    return Response.json({ error: _errMsg }, { status: 500 });
  }
}
