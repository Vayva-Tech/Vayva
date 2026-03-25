import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await request.json();
    const { status } = body; // CONFIRMED, CANCELLED
    if (!status)
      return NextResponse.json({ error: "Status required" }, { status: 400 });

    // Call backend API to update viewing status
    const result = await apiJson<{
      success: boolean;
      booking?: { id: string; status: string };
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/properties/viewings/${id}/status`,
      {
        method: "PATCH",
        headers: auth.headers,
        body: JSON.stringify({ status }),
      }
    );

    if (result.error) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    const resolvedParams = await Promise.resolve(params);
    handleApiError(
      e,
      {
        endpoint: `/api/properties/viewings/${resolvedParams.id}/status`,
        operation: "UPDATE_VIEWING_STATUS",
      }
    );
    throw e;
  }
}
