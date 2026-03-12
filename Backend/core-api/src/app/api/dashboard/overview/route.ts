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
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      const rangeKey = (searchParams.get("range") || "month") as
        | "today"
        | "week"
        | "month";

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

      const now = new Date();
      const days = rangeKey === "today" ? 1 : rangeKey === "week" ? 7 : 30;
      const start = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);

      const data = await DashboardService.getOverview(
        db,
        hasBookings,
        start,
        now,
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
      logger.error("[DASHBOARD_OVERVIEW]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch overview data" },
        { status: 500 },
      );
    }
  },
);
