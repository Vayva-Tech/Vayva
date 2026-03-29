import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const queryParams = new URLSearchParams({
      storeId,
      limit: limit.toString(),
    });

    if (query) queryParams.set("search", query);

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/core/products?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    // Transform backend response to match frontend expectations
    const formatted = (response.data?.products || []).map((product: any) => {
      const thumbnail =
        product.productImages?.[0]?.url ||
        product.productVariants?.[0]?.imageUrl ||
        null;

      return {
        id: product.id,
        name: product.title,
        handle: product.handle,
        price: Number(product.price) || 0,
        thumbnail,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/editor-data/products",
      operation: "GET_EDITOR_PRODUCTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
