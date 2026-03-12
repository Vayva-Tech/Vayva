import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DashboardService } from "@/services/dashboard.server";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (_req, { storeId, db }) => {
    try {
      const data = await DashboardService.getRecentActivity(db);

      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[DASHBOARD_ACTIVITY]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch activity" },
        { status: 500 },
      );
    }
  },
);
