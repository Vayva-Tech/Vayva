import { NextResponse, NextRequest } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

// GET /api/analytics/overview - Get dashboard analytics summary
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range =
      searchParams.get("range") ?? searchParams.get("period") ?? "7d";

    const result = await apiJson<{
      totalSales?: number;
      totalOrders?: number;
      activeCustomers?: number;
      aov?: number;
      error?: string;
    }>(
      `${backendBase()}/api/analytics/overview?range=${encodeURIComponent(range)}`,
      { headers: auth.headers },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/analytics/overview",
      operation: "GET_ANALYTICS_OVERVIEW",
    });
    return NextResponse.json(
      { error: "Failed to fetch analytics overview" },
      { status: 500 },
    );
  }
}
