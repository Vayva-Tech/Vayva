import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { getRedisClient } from "@/lib/redis";

const CACHE_TTL_SECONDS = 60;

// GET /api/dashboard/metrics - Get dashboard metrics
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const metric = searchParams.get("metric");

      const cacheKey = `dashboard:metrics:${storeId}:${metric || "all"}`;
      
      const redis = await getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }

      const queryParams = new URLSearchParams();
      if (metric) queryParams.set("metric", metric);

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/dashboard/metrics?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch metrics" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch metrics" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      
      await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(data));
      
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[DASHBOARD_METRICS_ERROR] Failed to fetch metrics", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch metrics" },
        { status: 500 }
      );
    }
  }
);
