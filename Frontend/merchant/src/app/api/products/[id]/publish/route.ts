import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Product id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const category =
      typeof body === "object" &&
      body !== null &&
      "category" in body &&
      typeof (body as { category?: unknown }).category === "string"
        ? (body as { category: string }).category
        : undefined;

    const result = await apiJson<{
      success: boolean;
      listing: {
        id: string;
        productId: string;
        category: string;
        status: string;
      };
    }>(`${process.env.BACKEND_API_URL}/api/products/${id}/publish`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({ category }),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/products/[id]/publish",
      operation: "PUBLISH_PRODUCT",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
