import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

const targetingRulesSchema = z.union([
  z.object({ enabled: z.boolean() }),
  z.object({ enabled: z.boolean(), percentage: z.number().min(0).max(100) }),
  z.object({ enabled: z.boolean(), segments: z.array(z.string()) }),
  z.object({ enabled: z.boolean(), plans: z.array(z.string()) }),
]);

const updateFeatureFlagSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["boolean", "percentage", "user_segment", "plan_based"]).optional(),
  targetingRules: targetingRulesSchema.optional(),
  isEnabled: z.boolean().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const featureFlag = await prisma.saaSFeatureFlag.findFirst({
        where: { id, storeId },
      });

      if (!featureFlag) {
        return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
      }

      return NextResponse.json({ featureFlag }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_FEATURE_FLAG_GET]", error, { storeId });
      return NextResponse.json({ error: "Failed to fetch feature flag" }, { status: 500 });
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const data = updateFeatureFlagSchema.parse(body);

      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;
      if (data.startAt !== undefined) updateData.startAt = data.startAt ? new Date(data.startAt) : null;
      if (data.endAt !== undefined) updateData.endAt = data.endAt ? new Date(data.endAt) : null;

      if (data.targetingRules !== undefined) {
        updateData.targetingRules = JSON.stringify(data.targetingRules);
      }

      const featureFlag = await prisma.saaSFeatureFlag.update({
        where: { id, storeId },
        data: updateData,
      });

      return NextResponse.json({ featureFlag }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_FEATURE_FLAG_PUT]", error, { storeId });
      return NextResponse.json({ error: "Failed to update feature flag" }, { status: 500 });
    }
  }
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      await prisma.saaSFeatureFlag.delete({
        where: { id, storeId },
      });

      return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_FEATURE_FLAG_DELETE]", error, { storeId });
      return NextResponse.json({ error: "Failed to delete feature flag" }, { status: 500 });
    }
  }
);
