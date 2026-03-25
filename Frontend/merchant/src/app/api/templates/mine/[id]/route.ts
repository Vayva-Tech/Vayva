import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { logger, standardHeaders } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    const correlationId =
      request.headers.get("x-request-id") || randomUUID();

    if (!id) {
      return NextResponse.json(
        { error: "Template project ID is required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

    const result = await apiJson<{ success: boolean; requestId: string }>(
      `${process.env.BACKEND_API_URL}/api/templates/mine/${id}`,
      {
        method: "DELETE",
        headers: auth.headers,
      },
    );

    logger.info("Template project deleted", {
      projectId: id,
      storeId,
      requestId: correlationId,
    });

    return NextResponse.json(result, {
      headers: standardHeaders(correlationId),
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/templates/mine/[id]",
      operation: "DELETE_TEMPLATE_MINE",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
