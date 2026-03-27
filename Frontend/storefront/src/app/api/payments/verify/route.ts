import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "reference is required" },
        { status: 400 }
      );
    }

    // Call backend payment verification endpoint
    const response = await apiClient.publicGet<any>('/api/v1/payments/verify', {
      reference,
    });

    return NextResponse.json({
      success: true,
      status: response.data.status,
      message: response.data.message,
      orderId: response.data.orderId,
      amount: response.data.amount,
      currency: response.data.currency,
    });
  } catch (error) {
    console.error("[PAYMENTS_VERIFY] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
