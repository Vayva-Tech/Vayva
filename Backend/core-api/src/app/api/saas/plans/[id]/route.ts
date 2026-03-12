import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceMonthly: z.number().min(0).optional(),
  priceYearly: z.number().min(0).optional(),
  currency: z.string().optional(),
  trialDays: z.number().int().min(0).optional(),
  isPublic: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  includedFeatures: z.array(z.string()).optional(),
  maxUsers: z.number().int().optional(),
  maxProjects: z.number().int().optional(),
  maxStorageGB: z.number().int().optional(),
  maxApiCalls: z.number().int().optional(),
  highlightFeature: z.string().optional(),
  badge: z.string().optional(),
  status: z.enum(["active", "archived", "draft"]).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const plan = await prisma.saaSPlan.findFirst({
        where: { id, storeId },
        include: {
          subscriptions: {
            where: { status: { in: ["active", "trialing"] } },
            include: { tenant: true },
            orderBy: { createdAt: "desc" },
          },
          _count: { select: { subscriptions: true } },
        },
      });

      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      return NextResponse.json({ plan }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_PLAN_GET]", error, { storeId });
      return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const data = updatePlanSchema.parse(body);

      // If setting as default, unset existing default
      if (data.isDefault) {
        await prisma.saaSPlan.updateMany({
          where: {
            storeId,
            isDefault: true,
            id: { not: id },
          },
          data: { isDefault: false },
        });
      }

      const updateData: Record<string, unknown> = { ...data };
      if (data.includedFeatures !== undefined) {
        updateData.includedFeatures = JSON.stringify(data.includedFeatures);
      }

      const plan = await prisma.saaSPlan.update({
        where: { id, storeId },
        data: updateData,
      });

      return NextResponse.json({ plan }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_PLAN_PUT]", error, { storeId });
      return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
    }
  }
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      // Check if plan has active subscriptions
      const activeSubs = await prisma.saaSSubscription.count({
        where: { planId: id, status: { in: ["active", "trialing"] } },
      });

      if (activeSubs > 0) {
        return NextResponse.json(
          { error: "Cannot delete plan with active subscriptions" },
          { status: 400 }
        );
      }

      await prisma.saaSPlan.delete({
        where: { id, storeId },
      });

      return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_PLAN_DELETE]", error, { storeId });
      return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
    }
  }
);
