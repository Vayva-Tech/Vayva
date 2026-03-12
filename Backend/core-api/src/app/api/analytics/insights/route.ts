import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DashboardService } from "@/services/dashboard.server";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.METRICS_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const insights = await DashboardService.getAnalyticsInsights(storeId);
      return NextResponse.json(
        { insights },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[ANALYTICS_INSIGHTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch insights" },
        { status: 500 },
      );
    }
  },
);
