import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// DELETE /api/nonprofit/volunteers/shifts/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const result = await apiJson<{ success: boolean; error?: string }>(
      `${buildBackendUrl(`/api/nonprofit/volunteers/shifts/${params.id}`)}?storeId=${storeId}`,
      {
        method: "DELETE",
        headers: auth.headers,
      }
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to delete shift");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: `/api/nonprofit/volunteers/shifts/${params.id}`,
      operation: "DELETE_SHIFT",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete shift", message: errorMessage },
      { status: 500 }
    );
  }
}
