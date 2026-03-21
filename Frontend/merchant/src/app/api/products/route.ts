import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/products - Get all products for the merchant
export async function GET(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");

    // Call backend API to fetch products
    const result = await apiJson<{
      data: Array<{ id: string; name: string; description: string; price: number; status: string }>;
      meta: { total: number; limit: number; offset: number };
    }>(
      `${process.env.BACKEND_API_URL}/api/products?limit=${limit}&offset=${offset}&status=${status || ''}&search=${search || ''}&categoryId=${categoryId || ''}`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/products',
      operation: 'GET_PRODUCTS',
      storeId,
    });
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
