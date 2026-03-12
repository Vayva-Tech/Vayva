import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { INDUSTRY_CONFIG } from "@/config/industry";
import type { IndustrySlug } from "@/lib/templates/types";
import { logger } from "@/lib/logger";
import { DashboardService } from "@/services/dashboard.server";

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (_req, { storeId, db }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { industrySlug: true },
      });
      const industrySlug = (store?.industrySlug || "retail") as IndustrySlug;
      const config = INDUSTRY_CONFIG[industrySlug] || INDUSTRY_CONFIG.retail;
      const hasBookings = Boolean(
        config?.features?.bookings ||
        config?.features?.reservations ||
        config?.features?.viewings,
      );
      const hasInventory = Boolean(config?.features?.inventory);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const data = await DashboardService.getKpis(
        db,
        storeId,
        hasBookings,
        hasInventory,
        thirtyDaysAgo,
        sixtyDaysAgo,
      );

      return NextResponse.json(
        {
          success: true,
          data,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[DASHBOARD_KPI]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch KPI data" },
        { status: 500 },
      );
    }
  },
);
