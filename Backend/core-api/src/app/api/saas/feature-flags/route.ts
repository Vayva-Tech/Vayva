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

const createFeatureFlagSchema = z.object({
  name: z.string().min(1),
  key: z.string().min(1).regex(/^[a-z0-9_]+$/),
  description: z.string().optional(),
  type: z.enum(["boolean", "percentage", "user_segment", "plan_based"]).default("boolean"),
  targetingRules: targetingRulesSchema,
  isEnabled: z.boolean().default(false),
  environment: z.enum(["development", "staging", "production"]).default("production"),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const environment = searchParams.get("environment") || "production";
      const isEnabled = searchParams.get("isEnabled");
      const search = searchParams.get("search");

      const where: Record<string, unknown> = {
        storeId,
        environment,
      };

      if (isEnabled !== null) {
        where.isEnabled = isEnabled === "true";
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { key: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const featureFlags = await prisma.saaSFeatureFlag.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        { featureFlags },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_FEATURE_FLAGS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch feature flags" },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, user }: APIContext) => {
    try {
      const body = await request.json();
      const data = createFeatureFlagSchema.parse(body);

      // Check if key already exists for this store and environment
      const existing = await prisma.saaSFeatureFlag.findFirst({
        where: {
          storeId,
          key: data.key,
          environment: data.environment,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Feature flag key already exists for this environment" },
          { status: 400 }
        );
      }

      const featureFlag = await prisma.saaSFeatureFlag.create({
        data: {
          ...data,
          targetingRules: JSON.stringify(data.targetingRules),
          startAt: data.startAt ? new Date(data.startAt) : null,
          endAt: data.endAt ? new Date(data.endAt) : null,
          storeId,
          createdBy: user?.id,
        },
      });

      return NextResponse.json(
        { featureFlag },
        { status: 201, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_FEATURE_FLAGS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create feature flag" },
        { status: 500 }
      );
    }
  }
);
