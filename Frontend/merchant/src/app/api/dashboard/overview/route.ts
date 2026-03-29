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
      const from = searchParams.get("from");
      const to = searchParams.get("to");

      // Build cache key
      const cacheKey = `dashboard:overview:${auth.user.storeId}:${from || "default"}:${to || "default"}`;
      
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

      // Call backend API
      const result = await apiJson(`${buildBackendUrl("/dashboard/overview")}${queryParams.size ? `?${queryParams.toString()}` : ""}`,
      {
          headers: auth.headers,
        }
      );
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/dashboard/overview", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
