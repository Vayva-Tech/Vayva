import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { plan: true },
      });

      if (!store) {
        return NextResponse.json({
          plan: "free",
          source: "fallback_store_not_found",
          isAuthenticated: true,
        });
      }

      // Determine Plan
      const dbPlan = (store.plan || "FREE").toLowerCase();

      // Normalized to BillingPlan (free | growth | pro)
      let normalizedPlan = "free";
      switch (dbPlan) {
        case "free":
          normalizedPlan = "free";
          break;
        case "growth":
          normalizedPlan = "growth";
          break;
        case "pro":
        case "business":
        case "enterprise":
          normalizedPlan = "pro";
          break;
        default:
          normalizedPlan = "free";
      }

      return NextResponse.json(
        {
          plan: normalizedPlan,
          source: "store_db",
          isAuthenticated: true,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[ME_PLAN_GET]", error, { storeId });
      return NextResponse.json(
        { plan: "free", source: "error", isAuthenticated: false },
        { status: 500 },
      );
    }
  },
);
