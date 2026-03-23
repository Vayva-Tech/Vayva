// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, fileId: string }> }
) {
  try {
    const { id, fileId } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson<{
      downloadUrl: string;
      filename: string;
      contentType: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/disputes/${id}/evidence/${fileId}/download`,
      {
        headers: { "x-store-id": storeId },
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/disputes/:id/evidence/:fileId/download", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
