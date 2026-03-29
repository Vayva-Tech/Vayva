import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { getRedisClient } from "@/lib/redis";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
      const metric = searchParams.get("metric");

      const cacheKey = `dashboard:metrics:${auth.user.storeId}:${metric || "all"}`;
      
      const redis = await getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }

      const queryParams = new URLSearchParams();
      if (metric) queryParams.set("metric", metric);
      const result = await apiJson(`${buildBackendUrl("/dashboard/metrics")}${queryParams.size ? `?${queryParams.toString()}` : ""}`,
      {
          headers: auth.headers,
        }
      );
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/dashboard/metrics", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
