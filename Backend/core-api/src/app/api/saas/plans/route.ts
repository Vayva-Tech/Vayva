import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

const createPlanSchema = z.object({
  name: z.string().min(1),
  planCode: z.string().min(1),
  description: z.string().optional(),
  priceMonthly: z.number().min(0),
  priceYearly: z.number().min(0),
  currency: z.string().default("USD"),
  trialDays: z.number().int().min(0).default(0),
  isPublic: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  includedFeatures: z.array(z.string()).optional(),
  maxUsers: z.number().int().optional(),
  maxProjects: z.number().int().optional(),
  maxStorageGB: z.number().int().optional(),
  maxApiCalls: z.number().int().optional(),
  highlightFeature: z.string().optional(),
  badge: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") || "active";
      const isPublic = searchParams.get("isPublic");
      const search = searchParams.get("search");

      const where: Record<string, unknown> = { storeId };

      if (status) where.status = status;
      if (isPublic !== null) where.isPublic = isPublic === "true";
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { planCode: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [plans, total] = await Promise.all([
        prisma.saaSPlan.findMany({
          where,
          orderBy: { sortOrder: "asc" },
        }),
        prisma.saaSPlan.count({ where }),
      ]);

      return NextResponse.json(
        { plans, total },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_PLANS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch plans" },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const body = await request.json();
      const data = createPlanSchema.parse(body);

      // Check if plan code already exists
      const existing = await prisma.saaSPlan.findFirst({
        where: { storeId, planCode: data.planCode },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Plan code already exists" },
          { status: 400 }
        );
      }

      // If this is the default plan, unset any existing default
      if (data.isDefault) {
        await prisma.saaSPlan.updateMany({
          where: { storeId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const plan = await prisma.saaSPlan.create({
        data: {
          ...data,
          includedFeatures: JSON.stringify(data.includedFeatures || []),
          storeId,
        },
      });

      return NextResponse.json({ plan }, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_PLANS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create plan" },
        { status: 500 }
      );
    }
  }
);
