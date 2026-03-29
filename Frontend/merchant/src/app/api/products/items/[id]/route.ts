import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/products/items/[id] - Get product item details
 */
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

    const product = await apiJson<{
      id: string;
      name: string;
      description: string;
      status: string;
      price: number;
      inventory: number;
      category: string;
      images: string[];
      variants: Array<{
        id: string;
        name: string;
        price: number;
        inventory: number;
        sku: string;
      }>;
      updatedAt: string;
    }>(`${process.env.BACKEND_API_URL}/api/products/items/${id}`, {
      headers: auth.headers,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/products/items/[id]",
      operation: "GET_PRODUCT_ITEM",
    });
    return NextResponse.json(
      { error: "Failed to fetch product item" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/products/items/[id] - Update product item
 */
export async function PUT(
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

    const body: unknown = await request.json();

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/products/items/${id}`, {
      method: "PUT",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/products/items/[id]",
      operation: "UPDATE_PRODUCT_ITEM",
    });
    return NextResponse.json(
      { error: "Failed to update product item" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/products/items/[id] - Delete product item
 */
export async function DELETE(
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
      success: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/products/items/${id}`, {
      method: "DELETE",
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/products/items/[id]",
      operation: "DELETE_PRODUCT_ITEM",
    });
    return NextResponse.json(
      { error: "Failed to delete product item" },
      { status: 500 },
    );
  }
}
