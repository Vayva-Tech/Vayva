// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));

    const { status, priority, metadata } = body;

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

    const result = await apiJson<{ success: boolean; data?: any; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/merchant/support/tickets/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify(updatePayload),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/support/tickets/:id", operation: "PATCH" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
