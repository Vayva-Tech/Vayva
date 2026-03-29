import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const TERMINAL_SHIPMENT_STATUSES = ["DELIVERED", "CANCELLED"] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shipmentId } = await params;
    if (!shipmentId || typeof shipmentId !== "string") {
      return NextResponse.json(
        { success: false, error: "Shipment id is required" },
        { status: 400 }
      );
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

    // Delegate shipment retry to backend
    const response = await apiJson(`${process.env.BACKEND_API_URL}/api/fulfillment/shipments/${shipmentId}/retry`, {
      method: 'POST',
      headers: auth.headers,
      body: JSON.stringify({ storeId }),
    });

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/fulfillment/shipments/:id/retry",
      operation: "POST",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
