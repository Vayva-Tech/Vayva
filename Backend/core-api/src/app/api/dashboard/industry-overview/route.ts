import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DashboardIndustryService } from "@/services/dashboard-industry.server";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (_req, { storeId, correlationId, db }) => {
    try {
      const data = await DashboardIndustryService.getIndustryOverview(
        db,
        storeId,
      );

      if (!data) {
        return NextResponse.json(
          { success: false, industryNative: false, requestId: correlationId },
          { headers: standardHeaders(correlationId) },
        );
      }

      return NextResponse.json(
        {
          success: true,
          industryNative: true,
          data,
          requestId: correlationId,
        },
        {
          headers: standardHeaders(correlationId),
        },
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error("Industry Overview API Error:", {
        error: errMsg,
        requestId: correlationId,
        storeId,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch industry overview",
          requestId: correlationId,
        },
        { status: 500, headers: standardHeaders(correlationId) },
      );
    }
  },
);
