import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export const dynamic = "force-dynamic";

// GET /api/properties/[id] - Get property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storeId: string | undefined;
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const result = await apiJson<unknown>(buildBackendUrl(`/api/properties/${id}`), {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/properties/[id]",
      operation: "GET_PROPERTY",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/[id] - Update property
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storeId: string | undefined;
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const body: unknown = await request.json();

    const result = await apiJson<unknown>(buildBackendUrl(`/api/properties/${id}`), {
      method: "PATCH",
      headers: {
        ...auth.headers,
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/properties/[id]",
      operation: "UPDATE_PROPERTY",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storeId: string | undefined;
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const result = await apiJson<unknown>(buildBackendUrl(`/api/properties/${id}`), {
      method: "DELETE",
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/properties/[id]",
      operation: "DELETE_PROPERTY",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
