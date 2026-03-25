import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { standardHeaders } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id: orderId } = await params;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const correlationId = request.headers.get("x-request-id") || crypto.randomUUID();
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const amount = Number(body?.amount);
    const reason = typeof body?.reason === "string" ? body.reason.trim() || null : null;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }

    const result = await apiJson<{
      success: boolean;
      refund?: {
        id: string;
        amount: number;
        status: string;
        currency: string;
      };
      error?: string;
    }>(buildBackendUrl(`/api/refunds/request/${orderId}`), {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({ amount, reason }),
    });

    if (result.error) {
      const status = result.error.includes("not found")
        ? 404
        : result.error.includes("not paid") ||
            result.error.includes("exceeds") ||
            result.error.includes("dispute")
          ? 409
          : 400;
      return NextResponse.json(
        { ...result, requestId: correlationId },
        { status, headers: standardHeaders(correlationId) },
      );
    }

    return NextResponse.json(
      { success: true, refund: result.refund, requestId: correlationId },
      { headers: standardHeaders(correlationId) },
    );
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/api/refunds/request/:id", operation: "POST" });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
