import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storeId: string | undefined;
  try {
    const { id } = await params;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;
    const result = await apiJson<unknown>(
      buildBackendUrl(`/api/merchant/whatsapp/broadcasts/${id}`),
      {
        headers: auth.headers,
      }
    );
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/merchant/whatsapp/broadcasts/[id]",
      operation: "GET",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storeId: string | undefined;
  try {
    const { id } = await params;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;
    const body: unknown = await request.json();
    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(buildBackendUrl(`/api/merchant/whatsapp/broadcasts/${id}`), {
      method: "PATCH",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to update broadcast");
    }

    return NextResponse.json(result.data);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/merchant/whatsapp/broadcasts/[id]",
      operation: "PATCH",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storeId: string | undefined;
  try {
    const { id } = await params;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;
    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(buildBackendUrl(`/api/merchant/whatsapp/broadcasts/${id}`), {
      method: "DELETE",
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to delete broadcast");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/merchant/whatsapp/broadcasts/[id]",
      operation: "DELETE",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
