import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DashboardService } from "@/services/dashboard.server";
import { logger } from "@/lib/logger";
import { withDashboardCache, invalidateDashboardOnDataChange } from "@/lib/dashboard-cache";
import type { UniversalDashboardResponse } from "@vayva/industry-core";
import { getEducationDashboardData } from "@vayva/industry-education/services";

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const rangeKey = (searchParams.get("range") || "month") as
        | "today"
        | "week"
        | "month";
      const industry = searchParams.get("industry") || "retail";
      
      // Handle education industry separately
      if (industry === 'education') {
        return await handleEducationDashboard(storeId, rangeKey);
      }
      
      // Use caching layer for optimized performance
      const { data: universalData, cached, etag, isStale } = await withDashboardCache<UniversalDashboardResponse>(
        'universal',
        storeId,
        async () => {
          // Instantiate Isolated Prisma Client for better performance
          const { getIsolatedPrisma } = await import("@vayva/db");
          const isolatedPrisma = getIsolatedPrisma();

          // Fetch all dashboard data in a single optimized call
          const rawData = await DashboardService.getAggregateData(
            isolatedPrisma,
            storeId,
            rangeKey,
          );

          // Transform to universal format
          const data: UniversalDashboardResponse = {
            success: true,
            data: {
              kpis: rawData.kpiData,
              metrics: rawData.metricsData,
              overview: rawData.overviewData,
              todosAlerts: rawData.todosAlertsData,
              activity: rawData.activityData,
              primaryObjects: rawData.recentPrimaryData,
              inventoryAlerts: rawData.inventoryAlertsData,
              customerInsights: rawData.customerInsightsData,
              earnings: rawData.earningsData,
              storeInfo: rawData.storeInfo,
            },
            timestamp: new Date().toISOString(),
          };

          return data;
        },
        rangeKey
      );

      // Add cache headers
      const headers: Record<string, string> = {
        "Cache-Control": "no-store", // Disable browser caching, rely on our Redis cache
        "Content-Type": "application/json",
        "ETag": etag,
      };

      if (cached) {
        headers["X-Cache"] = isStale ? "STALE" : "HIT";
        headers["X-Cache-Age"] = Math.floor((Date.now() - new Date(universalData.timestamp).getTime()) / 1000).toString();
      } else {
        headers["X-Cache"] = "MISS";
      }

      return NextResponse.json(universalData, {
        headers,
      });

    } catch (error) {
      logger.error("[DASHBOARD_UNIVERSAL_GET]", error, { storeId });
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to fetch universal dashboard data",
          timestamp: new Date().toISOString()
        },
        { status: 500 },
      );
    }
  },
);

// Helper function for education dashboard
async function handleEducationDashboard(storeId: string, rangeKey: string) {
  const { data: educationData, cached, etag, isStale } = await withDashboardCache(
    'education-dashboard',
    storeId,
    async () => {
      const { getIsolatedPrisma } = await import("@vayva/db");
      const isolatedPrisma = getIsolatedPrisma();

      const data = await getEducationDashboardData(
        isolatedPrisma,
        storeId,
        rangeKey as any
      );

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    },
    rangeKey
  );

  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
    "ETag": etag,
  };

  if (cached) {
    headers["X-Cache"] = isStale ? "STALE" : "HIT";
    headers["X-Cache-Age"] = Math.floor((Date.now() - new Date(educationData.timestamp).getTime()) / 1000).toString();
  } else {
    headers["X-Cache"] = "MISS";
  }

  return NextResponse.json(educationData, { headers });
}

// POST endpoint for cache invalidation (internal use)
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const { dataType = 'all' } = body;
      
      await invalidateDashboardOnDataChange(storeId, dataType);
      
      return NextResponse.json({
        success: true,
        message: `Dashboard cache invalidated for ${dataType} data changes`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error("[DASHBOARD_UNIVERSAL_POST]", error, { storeId });
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to invalidate dashboard cache",
          timestamp: new Date().toISOString()
        },
        { status: 500 },
      );
    }
  },
);