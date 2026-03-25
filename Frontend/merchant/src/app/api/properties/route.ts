import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/properties - Get all properties for the merchant
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // Build query params
    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());
    if (status) queryParams.set("status", status);
    if (type) queryParams.set("type", type);

    // Call backend API
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/properties?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/properties',
      operation: 'GET_PROPERTIES',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
