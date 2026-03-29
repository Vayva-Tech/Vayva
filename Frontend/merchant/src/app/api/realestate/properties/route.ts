import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
// GET /api/realestate/properties - Get properties with filters
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const purpose = searchParams.get("purpose");
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const queryParams = new URLSearchParams({
      storeId,
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
    });

    if (status) queryParams.set("status", status);
    if (type) queryParams.set("type", type);
    if (purpose) queryParams.set("purpose", purpose);
    if (city) queryParams.set("city", city);
    if (minPrice) queryParams.set("minPrice", minPrice);
    if (maxPrice) queryParams.set("maxPrice", maxPrice);

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/properties?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/realestate/properties",
      operation: "GET_PROPERTIES",
    });
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
