import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

const updateSubscriptionSchema = z.object({
  status: z.enum(["active", "trialing", "past_due", "cancelled", "paused"]).optional(),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
  customLimits: z.record(z.any()).optional(),
  customFeatures: z.array(z.string()).optional(),
  cancellationReason: z.string().optional(),
});

const cancelSubscriptionSchema = z.object({
  reason: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const subscription = await prisma.saaSSubscription.findFirst({
        where: { id, storeId },
        include: {
          tenant: true,
          plan: true,
        },
      });

      if (!subscription) {
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
      }

      return NextResponse.json({ subscription }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_SUBSCRIPTION_GET]", error, { storeId });
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const data = updateSubscriptionSchema.parse(body);

      const updateData: Record<string, unknown> = {};

      if (data.status !== undefined) {
        updateData.status = data.status;
        if (["cancelled", "paused"].includes(data.status)) {
          updateData.cancelledAt = new Date();
          if (data.cancellationReason) {
            updateData.cancellationReason = data.cancellationReason;
          }
        }
      }

      if (data.billingCycle !== undefined) updateData.billingCycle = data.billingCycle;
      if (data.customLimits !== undefined) {
        updateData.customLimits = JSON.stringify(data.customLimits);
      }
      if (data.customFeatures !== undefined) {
        updateData.customFeatures = JSON.stringify(data.customFeatures);
      }

      const subscription = await prisma.saaSSubscription.update({
        where: { id, storeId },
        data: updateData,
      });

      return NextResponse.json({ subscription }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_SUBSCRIPTION_PUT]", error, { storeId });
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
    }
  }
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json().catch(() => ({}));
      const data = cancelSubscriptionSchema.parse(body);

      const subscription = await prisma.saaSSubscription.update({
        where: { id, storeId },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: data.reason || "Cancelled by admin",
        },
      });

      return NextResponse.json({ subscription }, { headers: { "Cache-Control": "no-store" } });
    } catch (error: unknown) {
      logger.error("[SAAS_SUBSCRIPTION_DELETE]", error, { storeId });
      return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
    }
  }
);
