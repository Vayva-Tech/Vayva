import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<unknown>(
      buildBackendUrl(`/api/support/conversations/${id}/messages`),
      {
        headers: auth.headers,
      },
    );
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/api/support/conversations/:id/messages", operation: "GET" });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const result = await apiJson<unknown>(
      buildBackendUrl(`/api/support/conversations/${id}/messages`),
      {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify(body),
      },
    );
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/api/support/conversations/:id/messages", operation: "POST" });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
