import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

function backendBase(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));
    const result = await apiJson<{
      success: boolean;
      evidence?: { id: string; type: string; textExcerpt: string };
    }>(`${backendBase()}/api/disputes/${encodeURIComponent(id)}/evidence`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/disputes/:id/evidence", operation: "POST" });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
