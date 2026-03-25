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
    const result = await apiJson<unknown>(buildBackendUrl(`/api/portfolio/${id}`), {
      headers: auth.headers,
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/portfolio/[id]",
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
    const body: unknown = await request.json().catch(() => ({}));
    const result = await apiJson<unknown>(buildBackendUrl(`/api/portfolio/${id}`), {
      method: "PATCH",
      headers: auth.headers,
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/portfolio/[id]",
      operation: "PATCH",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
