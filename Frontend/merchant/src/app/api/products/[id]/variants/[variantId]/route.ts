import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string; variantId?: string }> },
) {
  try {
    const { id, variantId } = await params;
    if (!id || !variantId) {
      return NextResponse.json(
        { error: "Product id and variant id required" },
        { status: 400 },
      );
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{ success: boolean }>(
      `${process.env.BACKEND_API_URL}/api/products/${id}/variants/${variantId}`,
      {
        method: "DELETE",
        headers: auth.headers,
      },
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/products/[id]/variants/[variantId]",
      operation: "DELETE_VARIANT",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string; variantId?: string }> },
) {
  try {
    const { id, variantId } = await params;
    if (!id || !variantId) {
      return NextResponse.json(
        { error: "Product id and variant id required" },
        { status: 400 },
      );
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/products/${id}/variants/${variantId}`,
      {
        method: "PATCH",
        headers: auth.headers,
        body: JSON.stringify(body),
      },
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/products/[id]/variants/[variantId]",
      operation: "PATCH_VARIANT",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
