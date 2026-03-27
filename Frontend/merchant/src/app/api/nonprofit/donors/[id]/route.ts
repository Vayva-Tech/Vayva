import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// DELETE /api/nonprofit/donors/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const result = await apiJson<{ success: boolean; error?: string }>(
      `${buildBackendUrl(`/api/nonprofit/donors/${params.id}`)}?storeId=${storeId}`,
      {
        method: "DELETE",
        headers: auth.headers,
      }
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to delete donor");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: `/api/nonprofit/donors/${params.id}`,
      operation: "DELETE_DONOR",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete donor", message: errorMessage },
      { status: 500 }
    );
  }
}
