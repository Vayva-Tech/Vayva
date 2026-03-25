import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/inventory/transfers - Get stock transfers
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/inventory/transfers`,
      {
        headers: auth.headers,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/inventory/transfers",
      operation: "GET_INVENTORY_TRANSFERS",
    });
    return NextResponse.json(
      { error: "Failed to fetch stock transfers" },
      { status: 500 },
    );
  }
}
