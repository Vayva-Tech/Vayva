import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { status, priority, metadata } = body as Record<string, unknown>;

    const allowed_statuses = ["open", "in_progress", "waiting", "resolved", "closed"];
    const allowed_priorities = ["low", "medium", "high", "urgent"];

    if (status && !allowed_statuses.includes(String(status).toLowerCase())) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (priority && !allowed_priorities.includes(String(priority).toLowerCase())) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    if (metadata !== undefined && (metadata === null || typeof metadata !== "object" || Array.isArray(metadata))) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (status) updatePayload.status = String(status).toLowerCase();
    if (priority) updatePayload.priority = String(priority).toLowerCase();
    if (metadata !== undefined) updatePayload.metadata = metadata;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(buildBackendUrl(`/api/merchant/support/tickets/${id}`), {
      method: "PATCH",
      headers: auth.headers,
      body: JSON.stringify(updatePayload),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/merchant/support/tickets/[id]",
      operation: "PATCH",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
