import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/settlements - Get settlement history
export async function GET(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const queryParams = new URLSearchParams();
    if (status) queryParams.set("status", status);
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());

    // Call backend API
    const result = await apiJson(
      `${process?.env?.BACKEND_API_URL}/api/settlements?${queryParams}`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/settlements',
      operation: 'GET_SETTLEMENTS',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
