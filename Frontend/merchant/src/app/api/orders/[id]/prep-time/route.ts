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
    const body = await request.json().catch(() => ({}));
    const prepTimeMinutes = Number(body?.prepTimeMinutes);

    if (!Number.isFinite(prepTimeMinutes) || prepTimeMinutes < 5 || prepTimeMinutes > 480) {
      return NextResponse.json({ error: "Invalid prep time" }, { status: 400 });
    }

    const result = await apiJson<{ success: boolean }>(
      `${process.env.BACKEND_API_URL}/api/orders/${id}/prep-time`,
      {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify({ prepTimeMinutes }),
      }
    );

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/orders/:id/prep-time", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
