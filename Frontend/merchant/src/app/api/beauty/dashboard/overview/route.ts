import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/beauty/dashboard/overview
 * Returns comprehensive overview data for the beauty salon dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const queryParams = new URLSearchParams();
    if (date) queryParams.set("date", date);

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/beauty/dashboard/overview?${queryParams}`,
      { headers: auth.headers }
    );

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/beauty/dashboard/overview",
      operation: "GET_BEAUTY_DASHBOARD_OVERVIEW",
    });
    return NextResponse.json(
      { error: "Failed to fetch beauty dashboard overview" },
      { status: 500 }
    );
  }
}
