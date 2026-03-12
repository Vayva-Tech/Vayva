import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@vayva/db";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

const createSubscriptionSchema = z.object({
  tenantId: z.string(),
  planId: z.string(),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  isTrial: z.boolean().default(false),
  trialDays: z.number().int().min(0).optional(),
  customPrice: z.number().optional(),
  customLimits: z.record(z.any()).optional(),
  customFeatures: z.array(z.string()).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      const status = searchParams.get("status");
      const tenantId = searchParams.get("tenantId");
      const planId = searchParams.get("planId");

      const where: Record<string, unknown> = { storeId };

      if (status) where.status = status;
      if (tenantId) where.tenantId = tenantId;
      if (planId) where.planId = planId;

      const [subscriptions, total] = await Promise.all([
        prisma.saaSSubscription.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            tenant: { select: { id: true, name: true, tenantCode: true } },
            plan: { select: { id: true, name: true, priceMonthly: true, priceYearly: true } },
          },
        }),
        prisma.saaSSubscription.count({ where }),
      ]);

      return NextResponse.json(
        { subscriptions, total, page, limit },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_SUBSCRIPTIONS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
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
      const data = createSubscriptionSchema.parse(body);

      // Verify tenant exists
      const tenant = await prisma.saaSTenant.findFirst({
        where: { id: data.tenantId, storeId },
      });

      if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }

      // Verify plan exists
      const plan = await prisma.saaSPlan.findFirst({
        where: { id: data.planId, storeId },
      });

      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      // Check if tenant already has an active subscription
      const existingActive = await prisma.saaSSubscription.findFirst({
        where: {
          tenantId: data.tenantId,
          status: { in: ["active", "trialing"] },
        },
      });

      if (existingActive) {
        return NextResponse.json(
          { error: "Tenant already has an active subscription" },
          { status: 400 }
        );
      }

      const price = data.customPrice ??
        (data.billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly);

      const now = new Date();
      const trialDays = data.isTrial ? (data.trialDays ?? plan.trialDays) : 0;
      const trialEndsAt = trialDays > 0
        ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
        : null;

      const subscription = await prisma.saaSSubscription.create({
        data: {
          storeId,
          tenantId: data.tenantId,
          planId: data.planId,
          status: data.isTrial ? "trialing" : "active",
          billingCycle: data.billingCycle,
          price,
          currency: plan.currency,
          isTrial: data.isTrial,
          trialEndsAt,
          currentPeriodStart: now,
          currentPeriodEnd: trialEndsAt ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          customLimits: data.customLimits ? JSON.stringify(data.customLimits) : Prisma.JsonNull,
          customFeatures: data.customFeatures ? JSON.stringify(data.customFeatures) : Prisma.JsonNull,
        },
      });

      return NextResponse.json({ subscription }, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_SUBSCRIPTIONS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 }
      );
    }
  }
);
