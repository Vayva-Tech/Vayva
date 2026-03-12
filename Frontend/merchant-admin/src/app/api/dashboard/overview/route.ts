import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { getRedisClient } from "@/lib/redis";

const CACHE_TTL_SECONDS = 60; // Cache for 1 minute

// GET /api/dashboard/overview - Get dashboard overview
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const from = searchParams.get("from");
      const to = searchParams.get("to");

      // Build cache key
      const cacheKey = `dashboard:overview:${storeId}:${from || "default"}:${to || "default"}`;
      
      // Try to get from cache
      const redis = await getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }

      // Build query params
      const queryParams = new URLSearchParams();
      if (from) queryParams.set("from", from);
      if (to) queryParams.set("to", to);

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/dashboard/overview?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch dashboard overview" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch dashboard overview" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      
      // Cache the response
      await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(data));
      
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[DASHBOARD_OVERVIEW_ERROR] Failed to fetch dashboard overview", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch dashboard overview" },
        { status: 500 }
      );
    }
  }
);
