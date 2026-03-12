import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

import { CampaignCreateSchema } from "@/lib/validations/campaign";

/**
 * GET /api/campaigns
 * List all fundraising campaigns for nonprofit
 */
export const GET = withVayvaAPI(
  PERMISSIONS.MARKETING_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
      const skip = (page - 1) * limit;

      const [campaigns, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            storeId,
            productType: "CAMPAIGN",
            ...(status && { status: status as any }),
          },
          include: {
            productImages: { take: 1, orderBy: { position: "asc" } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.product.count({
          where: {
            storeId,
            productType: "CAMPAIGN",
            ...(status && { status: status as any }),
          },
        }),
      ]);

      return NextResponse.json(
        {
          campaigns: campaigns.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            goalAmount: Number(c.price),
            status: c.status,
            image: c.productImages[0]?.url || null,
            metadata: c.metadata,
            createdAt: c.createdAt,
          })),
          meta: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[CAMPAIGNS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

/**
 * POST /api/campaigns
 * Create a new fundraising campaign
 */
// POST Create Campaign
export const POST = withVayvaAPI(
  PERMISSIONS.MARKETING_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json().catch(() => ({}));
      const validation = CampaignCreateSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.format(),
          },
          { status: 400 },
        );
      }

      const data = validation.data;

      const handle = `${data.title}-${Date.now()}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      const campaign = await prisma.product.create({
        data: {
          storeId,
          title: data.title,
          description: data.description,
          price: data.goalAmount,
          handle,
          status: "ACTIVE",
          productType: "CAMPAIGN",
          metadata: {
            endDate: data.endDate || null,
            tiers: data.tiers || [],
            raisedAmount: 0,
            donorCount: 0,
          } as Prisma.InputJsonValue,
          // Images are not in the schema yet, preserving empty array if not provided
          productImages: undefined,
        },
        include: {
          productImages: true,
        },
      });

      return NextResponse.json({ campaign }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[CAMPAIGNS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
