import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id: productId } = await params;
    if (!productId) {
      return NextResponse.json({ error: "Product id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<
      Array<{
        id: string;
        variantId: string;
        variantName: string;
        quantity: number;
        type: string;
        createdAt: string;
        inventoryLocation: {
          name: string;
        };
      }>
    >(
      `${process.env.BACKEND_API_URL}/api/products/${productId}/inventory/history`,
      {
        headers: auth.headers,
      },
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/products/[id]/inventory/history",
      operation: "GET_INVENTORY_HISTORY",
    });
    return NextResponse.json(
      { error: "Failed to fetch inventory history" },
      { status: 500 },
    );
  }
}
