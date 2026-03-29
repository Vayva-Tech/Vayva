import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/dashboard/earnings - Get earnings data
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const queryParams = new URLSearchParams();
    if (from) queryParams.set("from", from);
    if (to) queryParams.set("to", to);
    
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/dashboard/earnings?${queryParams.toString()}`, {
      headers: auth.headers,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/dashboard/earnings",
      operation: "GET_EARNINGS",
    });
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
