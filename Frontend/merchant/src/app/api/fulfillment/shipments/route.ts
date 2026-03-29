import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const isIssue = searchParams.get("issue") === "true";

    const queryParams = new URLSearchParams({ storeId });
    if (isIssue) {
      queryParams.set("status", "FAILED,EXCEPTION,RETURNED,RETURN_REQUESTED");
    } else if (statusFilter && statusFilter !== "ALL") {
      queryParams.set("status", statusFilter);
    }

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/fulfillment/shipments?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    // Transform backend response to match frontend expectations
    const formatted = (response.data?.shipments || []).map((shipment: any) => ({
      id: shipment.id,
      orderId: shipment.orderId,
      orderNumber: shipment.order?.orderNumber || "Unknown",
      status: shipment.status,
      provider: shipment.provider,
      trackingCode: shipment.trackingCode,
      trackingUrl: shipment.trackingUrl,
      courierName: shipment.courierName,
      recipientName: shipment.recipientName,
      updatedAt: shipment.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formatted }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/fulfillment/shipments", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
