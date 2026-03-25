import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/merchant/autopilot/feed
 * Proxies core-api Autopilot feed (runs, pendingCount).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";
    const status = searchParams.get("status");

    const qs = new URLSearchParams({ limit, offset });
    if (status) qs.set("status", status);

    const base = process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
    const res = await fetch(
      `${base}/api/merchant/autopilot/feed?${qs.toString()}`,
      {
        headers: auth.headers,
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/merchant/autopilot/feed",
      operation: "GET_AUTOPILOT_FEED",
    });
    return NextResponse.json(
      { error: "Failed to fetch autopilot feed" },
      { status: 500 },
    );
  }
}
