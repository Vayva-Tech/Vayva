import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { getEducationDashboardData } from "@vayva/industry-education/services";
import { withDashboardCache } from "@/lib/dashboard-cache";

/**
 * GET /api/education/dashboard/stats
 * 
 * Get comprehensive education dashboard statistics
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const range = (searchParams.get("range") || "month") as 
        | "today"
        | "week"
        | "month"
        | "quarter"
        | "year";

      // Use caching layer for better performance
      const { data: dashboardData, cached, etag } = await withDashboardCache(
        'education-dashboard',
        storeId,
        async () => {
          // Get isolated Prisma client for better performance
          const { getIsolatedPrisma } = await import("@vayva/db");
          const isolatedPrisma = getIsolatedPrisma();

          // Fetch all education dashboard data
          const data = await getEducationDashboardData(
            isolatedPrisma,
            storeId,
            range
          );

          return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
          };
        },
        range
      );

      // Add cache headers
      const headers: Record<string, string> = {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
        "ETag": etag,
      };

      if (cached) {
        headers["X-Cache"] = "HIT";
        headers["X-Cache-Age"] = Math.floor(
          (Date.now() - new Date(dashboardData.timestamp).getTime()) / 1000
        ).toString();
      } else {
        headers["X-Cache"] = "MISS";
      }

      return NextResponse.json(dashboardData, { headers });
    } catch (error) {
      logger.error("[EDUCATION_DASHBOARD_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch education dashboard data",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  },
);
