// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const correlationId = request.headers.get("x-request-id") || crypto.randomUUID();

    if (!id) {
      return NextResponse.json(
        { error: "Template project ID is required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }

    // Call backend API to delete template
    const result = await apiJson<{ success: boolean; requestId: string }>(
      `${process.env.BACKEND_API_URL}/api/templates/mine/${id}`,
      {
        method: "DELETE",
        headers: {
          "x-store-id": storeId,
        },
      }
    );
    
    logger.info("Template project deleted", {
      projectId: id,
      storeId,
      requestId: correlationId,
    });

    return NextResponse.json(result, { headers: standardHeaders(correlationId) });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/templates/mine/:id", operation: "DELETE" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
