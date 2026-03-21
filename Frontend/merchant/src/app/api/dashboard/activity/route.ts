// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { getRedisClient } from "@/lib/redis";

const CACHE_TTL_SECONDS = 60;

// GET /api/dashboard/activity - Get dashboard activity
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const cacheKey = `dashboard:activity:${storeId}:${limit}`;
    
    const redis = await getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/dashboard/activity?${queryParams.toString()}`, {
      headers: {
        "x-store-id": storeId,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/dashboard/activity",
      operation: "GET_DASHBOARD_ACTIVITY",
    });
    return NextResponse.json(
      { error: "Failed to fetch dashboard activity" },
      { status: 500 }
    );
  }
}
