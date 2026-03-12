import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const CampaignQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).optional(),
  categoryId: z.string().optional(),
  minGoal: z.coerce.number().optional(),
  maxGoal: z.coerce.number().optional(),
  search: z.string().optional(),
});

const CampaignCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  goal: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  targetAudience: z.string().optional(),
  tags: z.array(z.string()).default([]),
  allowAnonymous: z.boolean().default(true),
  allowRecurring: z.boolean().default(true),
  matchingGifts: z.boolean().default(false),
  corporateSponsorship: z.boolean().default(false),
});

export const GET = withVayvaAPI(
  PERMISSIONS.CAMPAIGNS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = CampaignQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, status, categoryId, minGoal, maxGoal, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (categoryId) where.categoryId = categoryId;
      if (minGoal !== undefined || maxGoal !== undefined) {
        where.goal = {};
        if (minGoal !== undefined) where.goal.gte = minGoal;
        if (maxGoal !== undefined) where.goal.lte = maxGoal;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [campaigns, total] = await Promise.all([
        prisma.nonprofitCampaign.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                donations: true,
                supporters: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.nonprofitCampaign.count({ where }),
      ]);

      // Calculate progress for each campaign
      const campaignsWithProgress = await Promise.all(
        campaigns.map(async (campaign) => {
          const donationStats = await prisma.nonprofitDonation.aggregate({
            where: { 
              campaignId: campaign.id,
              status: "completed"
            },
            _sum: { amount: true },
            _count: { id: true },
          });

          const raisedAmount = donationStats._sum.amount || 0;
          const progressPercentage = campaign.goal > 0 ? (raisedAmount / campaign.goal) * 100 : 0;

          return {
            ...campaign,
            raisedAmount,
            donationCount: donationStats._count.id,
            progressPercentage: Math.round(progressPercentage * 100) / 100,
            daysRemaining: Math.max(0, Math.ceil((campaign.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
          };
        })
      );

      return NextResponse.json(
        {
          data: campaignsWithProgress,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_CAMPAIGNS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch campaigns" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.CAMPAIGNS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = CampaignCreateSchema.safeParse(json);

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

      // Validate date range
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      if (startDate < new Date()) {
        return NextResponse.json(
          { error: "Start date cannot be in the past" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const campaign = await prisma.nonprofitCampaign.create({
        data: {
          storeId,
          name: body.name,
          description: body.description,
          goal: body.goal,
          currency: body.currency,
          startDate,
          endDate,
          categoryId: body.categoryId,
          imageUrl: body.imageUrl,
          videoUrl: body.videoUrl,
          targetAudience: body.targetAudience,
          tags: JSON.stringify(body.tags),
          allowAnonymous: body.allowAnonymous,
          allowRecurring: body.allowRecurring,
          matchingGifts: body.matchingGifts,
          corporateSponsorship: body.corporateSponsorship,
          status: "draft",
        },
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
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_CAMPAIGNS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create campaign" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);