import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

function backendBase(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id, fileId } = await params;
    if (!id || !fileId) {
      return NextResponse.json({ error: "Missing id or fileId" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      downloadUrl: string;
      filename: string;
      contentType: string;
    }>(
      `${backendBase()}/api/disputes/${encodeURIComponent(id)}/evidence/${encodeURIComponent(fileId)}/download`,
      {
        headers: auth.headers,
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/disputes/:id/evidence/:fileId/download",
      operation: "GET",
    });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
