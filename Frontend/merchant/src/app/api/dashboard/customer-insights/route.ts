import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/dashboard/customer-insights - Get customer insights
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/dashboard/customer-insights`,
      {
        headers: auth.headers,
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/dashboard/customer-insights",
      operation: "GET_CUSTOMER_INSIGHTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch customer insights" },
      { status: 500 }
    );
  }
}
