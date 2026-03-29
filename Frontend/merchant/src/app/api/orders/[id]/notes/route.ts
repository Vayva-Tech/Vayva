import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "Order id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));
    const note =
      typeof body === "object" &&
      body !== null &&
      "note" in body &&
      typeof (body as { note?: unknown }).note === "string"
        ? (body as { note: string }).note
        : "";

    if (!note.trim()) {
      return NextResponse.json({ error: "Note cannot be empty" }, { status: 400 });
    }

    const result = await apiJson<{ success: boolean }>(
      `${process.env.BACKEND_API_URL}/api/orders/${orderId}/notes`,
      {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify({ note }),
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/orders/[id]/notes",
      operation: "POST_ORDER_NOTE",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
