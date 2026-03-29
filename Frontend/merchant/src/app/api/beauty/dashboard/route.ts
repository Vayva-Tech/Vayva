import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { apiJson } from "@/lib/api-client-shared";

// GET /api/beauty/dashboard - Get beauty salon dashboard metrics
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
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const queryParams = new URLSearchParams();
    if (from) queryParams.set("from", from);
    if (to) queryParams.set("to", to);

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/beauty/dashboard?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/beauty/dashboard",
      operation: "GET_BEAUTY_DASHBOARD",
    });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
