import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Product id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      inventory: Array<{
        id: string;
        title: string;
        sku: string;
        inventory: number;
      }>;
    }>(`${process.env.BACKEND_API_URL}/api/products/${id}/inventory`, {
      headers: auth.headers,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/products/[id]/inventory",
      operation: "GET_INVENTORY",
    });
    return NextResponse.json(
      { error: "Failed to fetch product inventory" },
      { status: 500 },
    );
  }
}
