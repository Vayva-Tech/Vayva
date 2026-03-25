import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

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

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/analytics/insights?storeId=${encodeURIComponent(storeId)}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch insights');
    }

    return NextResponse.json({ insights: result.data }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/analytics/insights",
        operation: "GET_ANALYTICS_INSIGHTS",
      }
    );
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
