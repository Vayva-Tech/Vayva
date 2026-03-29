import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{ success: boolean; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/domains/${id}`,
      {
        method: "DELETE",
        headers: auth.headers,
      },
    );

    if (result.error) {
      const status = result.error.includes("verified") ? 409 : 404;
      return NextResponse.json(result, {
        status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/domains/[id]",
      operation: "DELETE_DOMAIN",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
