import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DashboardService } from "@/services/dashboard.server";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.METRICS_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const range = searchParams.get("range") || "7d";
      const data = await DashboardService.getAnalyticsOverview(storeId, range);
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      logger.error("[ANALYTICS_OVERVIEW_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 },
      );
    }
  },
);
