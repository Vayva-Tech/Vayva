import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/products/summary - Get product summary statistics
export async function GET(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
    // Call backend API
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/products/summary`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/products/summary',
      operation: 'GET_PRODUCTS_SUMMARY',
      storeId,
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
