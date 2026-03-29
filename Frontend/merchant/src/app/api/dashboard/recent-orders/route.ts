import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/dashboard/recent-orders - Get recent orders
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "5", 10);

    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/dashboard/recent-orders?${queryParams.toString()}`, {
      headers: auth.headers,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/dashboard/recent-orders",
      operation: "GET_RECENT_ORDERS",
    });
    return NextResponse.json(
      { error: "Failed to fetch recent orders" },
      { status: 500 }
    );
  }
}
