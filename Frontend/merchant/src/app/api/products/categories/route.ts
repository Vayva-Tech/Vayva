import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/products/categories - Get product categories
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/products/categories`,
      {
        headers: auth.headers,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/products/categories",
      operation: "GET_PRODUCT_CATEGORIES",
    });
    return NextResponse.json(
      { error: "Failed to fetch product categories" },
      { status: 500 },
    );
  }
}
