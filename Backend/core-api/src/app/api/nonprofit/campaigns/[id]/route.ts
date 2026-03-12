import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const CampaignUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  goal: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  targetAudience: z.string().optional(),
  tags: z.array(z.string()).optional(),
  allowAnonymous: z.boolean().optional(),
  allowRecurring: z.boolean().optional(),
  matchingGifts: z.boolean().optional(),
  corporateSponsorship: z.boolean().optional(),
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const campaign = await prisma.nonprofitCampaign.findFirst({
      where: { id, storeId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        donations: {
          where: { status: "completed" },
          select: {
            id: true,
            amount: true,
            createdAt: true,
            donor: {
              select: {
                firstName: true,
                lastName: true,
                organization: true,
                anonymous: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        supporters: {
          select: {
            id: true,
            donor: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          take: 10,
        },
        _count: {
          select: {
            donations: { where: { status: "completed" } },
            supporters: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate campaign progress
    const totalRaised = campaign.donations.reduce((sum, d) => sum + d.amount, 0);
    const progressPercentage = campaign.goal > 0 ? (totalRaised / campaign.goal) * 100 : 0;
    const daysRemaining = Math.max(0, Math.ceil((campaign.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // Parse tags
    const campaignWithProgress = {
      ...campaign,
      tags: JSON.parse(campaign.tags || "[]"),
      totalRaised,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      daysRemaining,
    };

    return NextResponse.json(
      { data: campaignWithProgress },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[NONPROFIT_CAMPAIGN_GET]", { error, campaignId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export const PUT = withVayvaAPI(
  PERMISSIONS.CAMPAIGNS_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext & { params: { id: string } }) => {
    const requestId = correlationId;
    try {
      const { id } = params;
      const json = await req.json().catch(() => ({}));
      const parseResult = CampaignUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid campaign data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Check if campaign exists
      const existingCampaign = await prisma.nonprofitCampaign.findFirst({
        where: { id, storeId },
      });

      if (!existingCampaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Verify category exists if provided
      if (body.categoryId) {
        const category = await prisma.nonprofitCampaignCategory.findFirst({
          where: { id: body.categoryId, storeId },
        });
        
        if (!category) {
          return NextResponse.json(
            { error: "Category not found" },
            { status: 404, headers: standardHeaders(requestId) }
          );
        }
      }

      // Validate date range if provided
      let startDate, endDate;
      if (body.startDate) startDate = new Date(body.startDate);
      if (body.endDate) endDate = new Date(body.endDate);
      
      if (startDate && endDate && startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const updateData: any = {};
      if (body.name) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.goal) updateData.goal = body.goal;
      if (body.currency) updateData.currency = body.currency;
      if (body.startDate) updateData.startDate = startDate;
      if (body.endDate) updateData.endDate = endDate;
      if (body.categoryId) updateData.categoryId = body.categoryId;
      if (body.imageUrl) updateData.imageUrl = body.imageUrl;
      if (body.videoUrl) updateData.videoUrl = body.videoUrl;
      if (body.targetAudience) updateData.targetAudience = body.targetAudience;
      if (body.tags) updateData.tags = JSON.stringify(body.tags);
      if (body.allowAnonymous !== undefined) updateData.allowAnonymous = body.allowAnonymous;
      if (body.allowRecurring !== undefined) updateData.allowRecurring = body.allowRecurring;
      if (body.matchingGifts !== undefined) updateData.matchingGifts = body.matchingGifts;
      if (body.corporateSponsorship !== undefined) updateData.corporateSponsorship = body.corporateSponsorship;
      if (body.status) updateData.status = body.status;

      const campaign = await prisma.nonprofitCampaign.update({
        where: { id },
        data: updateData,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json(campaign, {
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_CAMPAIGN_PUT]", { error, campaignId: params.id, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to update campaign" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);