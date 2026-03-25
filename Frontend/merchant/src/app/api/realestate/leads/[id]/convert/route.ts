import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// POST /api/realestate/leads/[id]/convert - Convert a lead to client
export async function POST(
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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { propertyId, contractType, agentId, notes } = body as Record<string, unknown>;

    const result = await apiJson<{
      success: boolean;
      data?: { lead: unknown; message: string; opportunity?: unknown };
      error?: string;
    }>(buildBackendUrl(`/api/realestate/leads/${id}/convert`), {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({
        propertyId,
        contractType,
        agentId,
        notes,
      }),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/realestate/leads/[id]/convert",
      operation: "CONVERT_LEAD",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to convert lead" },
      { status: 500 }
    );
  }
}
