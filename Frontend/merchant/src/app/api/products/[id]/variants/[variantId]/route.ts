// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, variantId: string }> }
) {
  try {
    const { id, variantId } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson<{ success: boolean }>(
      `${process.env.BACKEND_API_URL}/api/products/${id}/variants/${variantId}`,
      {
        method: "DELETE",
        headers: { "x-store-id": storeId },
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/products/:id/variants/:variantId", operation: "DELETE" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, variantId: string }> }
) {
  try {
    const { id, variantId } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/products/${id}/variants/${variantId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-store-id": storeId },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/products/:id/variants/:variantId", operation: "PATCH" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
