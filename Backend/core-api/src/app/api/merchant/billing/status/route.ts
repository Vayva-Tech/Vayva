import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (_req, { storeId }) => {
    try {
      const [store, subscription] = await Promise.all([
        prisma.store.findUnique({
          where: { id: storeId },
          select: { plan: true },
        }),
        prisma.merchantAiSubscription.findUnique({
          where: { storeId },
          select: { planKey: true, status: true, periodEnd: true },
        }),
      ]);

      const planKey = (
        subscription?.planKey ||
        store?.plan ||
        "FREE"
      ).toLowerCase();
      const status = String(subscription?.status || "ACTIVE").toLowerCase();
      const periodEnd = subscription?.periodEnd || null;

      const data = {
        planKey,
        status,
        periodEnd,
        cancelAtPeriodEnd: false,
        invoices: [],
      };

      return NextResponse.json(
        {
          currentPlan: data,
          status,
          subscription: subscription
            ? {
                status: subscription.status,
                periodEnd: subscription.periodEnd,
              }
            : null,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[BILLING_STATUS_GET]", error);
      return NextResponse.json(
        { error: "Failed to fetch billing status" },
        { status: 500 },
      );
    }
  },
);
