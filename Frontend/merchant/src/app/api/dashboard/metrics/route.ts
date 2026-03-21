import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { getRedisClient } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
      const metric = searchParams.get("metric");

      const cacheKey = `dashboard:metrics:${storeId}:${metric || "all"}`;
      
      const redis = await getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }

      const queryParams = new URLSearchParams();
      if (metric) queryParams.set("metric", metric);// Call backend API
      const result = await apiJson(`${process.env.BACKEND_API_URL}/api/endpoint`,
      {
          headers: {
            "x-store-id": storeId,
          },
        }
      );
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/dashboard/metrics", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
