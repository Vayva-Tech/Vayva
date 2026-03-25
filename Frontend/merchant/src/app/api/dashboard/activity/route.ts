import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { getRedisClient } from "@/lib/redis";

// GET /api/dashboard/activity - Get dashboard activity
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);

    const cacheKey = `dashboard:activity:${storeId}:${limit}`;

    const redis = await getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached != null && cached !== "") {
      const raw =
        typeof cached === "string"
          ? cached
          : Buffer.isBuffer(cached)
            ? cached.toString("utf8")
            : typeof cached === "number"
              ? String(cached)
              : null;
      if (raw != null) {
        return NextResponse.json(JSON.parse(raw) as unknown);
      }
    }

    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/dashboard/activity?${queryParams.toString()}`, {
      headers: auth.headers,
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
