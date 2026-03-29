import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/fitness/memberships - Get all memberships for the merchant
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const queryParams = new URLSearchParams({
      storeId,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (status) queryParams.set("status", status);
    if (search) queryParams.set("search", search);

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/fitness/memberships?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/fitness/memberships",
      operation: "GET_FITNESS_MEMBERSHIPS",
    });
    return NextResponse.json(
      { error: "Failed to fetch memberships" },
      { status: 500 }
    );
  }
}
