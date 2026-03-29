import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/inventory/locations - Get inventory locations
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/inventory/locations`,
      {
        headers: auth.headers,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/inventory/locations",
      operation: "GET_INVENTORY_LOCATIONS",
    });
    return NextResponse.json(
      { error: "Failed to fetch inventory locations" },
      { status: 500 },
    );
  }
}
