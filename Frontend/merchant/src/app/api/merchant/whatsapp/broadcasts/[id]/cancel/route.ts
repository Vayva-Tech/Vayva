import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/merchant/whatsapp/broadcasts/${id}/cancel`,
      {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify({}),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/whatsapp/broadcasts/:id/cancel", operation: "POST" });
    return NextResponse.json({ error: "Failed to cancel broadcast" }, { status: 500 });
  }
}
