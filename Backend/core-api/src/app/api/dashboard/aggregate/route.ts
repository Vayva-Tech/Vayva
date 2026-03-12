import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DashboardService } from "@/services/dashboard.server";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const rangeKey = (searchParams.get("range") || "month") as
        | "today"
        | "week"
        | "month";

      // Instantiate Isolated Prisma Client
      const { getIsolatedPrisma } = await import("@vayva/db");
      const isolatedPrisma = getIsolatedPrisma();

      const data = await DashboardService.getAggregateData(
        isolatedPrisma,
        storeId,
        rangeKey,
      );

      return NextResponse.json({
        success: true,
        data,
      });
    } catch (error) {
      logger.error("[DASHBOARD_AGGREGATE_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch aggregated dashboard data" },
        { status: 500 },
      );
    }
  },
);
