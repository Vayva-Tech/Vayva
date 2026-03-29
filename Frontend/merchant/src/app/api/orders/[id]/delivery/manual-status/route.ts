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
    const rec =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const toStatus = typeof rec.status === "string" ? rec.status : "";
    const note = typeof rec.note === "string" ? rec.note : undefined;
    const courierName = typeof rec.courierName === "string" ? rec.courierName : undefined;
    const courierPhone = typeof rec.courierPhone === "string" ? rec.courierPhone : undefined;
    const trackingUrl = typeof rec.trackingUrl === "string" ? rec.trackingUrl : undefined;

    if (!toStatus) {
      return NextResponse.json(
        { success: false, error: "Missing status" },
        { status: 400 },
      );
    }

    const result = await apiJson<{
      success: boolean;
      data?: { id: string; status: string };
      shipment?: { id: string; status: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/orders/${orderId}/delivery/manual-status`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({
        status: toStatus,
        note,
        courierName,
        courierPhone,
        trackingUrl,
      }),
    });

    if (result.error) {
      const status = result.error.includes("not found")
        ? 404
        : result.error.includes("only for Custom")
          ? 400
          : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      shipment: result.shipment,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/orders/[id]/delivery/manual-status",
      operation: "POST_MANUAL_DELIVERY_STATUS",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
