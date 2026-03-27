import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    const orderId = searchParams.get("orderId");
    const ref = searchParams.get("ref");
    const phone = searchParams.get("phone");

    // Validate required params
    if (!orderId && !ref && !reference) {
      return NextResponse.json(
        { error: "Missing orderId, ref, or reference" },
        { status: 400 }
      );
    }

    if (ref && !phone) {
      return NextResponse.json(
        { error: "Phone is required when looking up by ref" },
        { status: 400 }
      );
    }

    // Build query params for backend API
    const params: Record<string, string> = {};
    if (reference) params.reference = reference;
    if (orderId) params.orderId = orderId;
    if (ref) params.ref = ref;
    if (phone) params.phone = phone;

    // Call backend orders status endpoint (public endpoint for order tracking)
    const response = await apiClient.publicGet<any>('/api/v1/orders/status', params);

    return NextResponse.json({
      id: response.data?.id,
      refCode: response.data?.refCode,
      orderNumber: response.data?.orderNumber,
      status: response.data?.status,
      paymentStatus: response.data?.paymentStatus,
      deliveryMethod: response.data?.deliveryMethod,
      subtotal: response.data?.subtotal,
      shippingTotal: response.data?.shippingTotal,
      total: response.data?.total,
      items: response.data?.items,
      customer: response.data?.customer,
      timeline: response.data?.timeline,
    });
  } catch (error) {
    console.error("[ORDERS_STATUS] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
