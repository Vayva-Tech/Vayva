import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/collections/[id] - Get collection details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id: collectionId } = await params;
    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection id required" },
        { status: 400 },
      );
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: {
        id: string;
        title: string;
        description: string;
        handle: string;
        imageUrl: string | null;
        productCount: number;
        isAutomated: boolean;
        conditions: unknown;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/collections/${collectionId}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch collection");
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/collections/[id]",
      operation: "GET_COLLECTION",
    });
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/collections/[id] - Update collection
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id: collectionId } = await params;
    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection id required" },
        { status: 400 },
      );
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
    }>(`${process.env.BACKEND_API_URL}/api/collections/${collectionId}`, {
      method: "PUT",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to update collection");
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/collections/[id]",
      operation: "UPDATE_COLLECTION",
    });
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/collections/[id] - Delete collection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id: collectionId } = await params;
    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection id required" },
        { status: 400 },
      );
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/collections/${collectionId}`, {
      method: "DELETE",
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to delete collection");
    }

    return NextResponse.json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/collections/[id]",
      operation: "DELETE_COLLECTION",
    });
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 },
    );
  }
}
