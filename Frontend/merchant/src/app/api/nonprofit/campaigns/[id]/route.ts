import { NextRequest } from "next/server";
import { prisma, logger } from "@vayva/shared";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaign = await prisma.donationCampaign.findUnique({
      where: { id: params.id },
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

    if (!campaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    return Response.json({ data: [campaign] });
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[CAMPAIGN_GET_ERROR]", { error: _errMsg });
    return Response.json({ error: _errMsg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const campaign = await prisma.donationCampaign.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        goal: body.goal ? parseFloat(body.goal) : undefined,
        currency: body.currency,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        category: body.category,
        status: body.status,
        impactMetrics: body.impactMetrics,
      },
    });

    return Response.json({ data: campaign });
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[CAMPAIGN_UPDATE_ERROR]", { error: _errMsg });
    return Response.json({ error: _errMsg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.donationCampaign.delete({
      where: { id: params.id },
    });

    return Response.json({ success: true });
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[CAMPAIGN_DELETE_ERROR]", { error: _errMsg });
    return Response.json({ error: _errMsg }, { status: 500 });
  }
}
