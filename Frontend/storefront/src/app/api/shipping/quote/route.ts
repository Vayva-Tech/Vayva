import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pickupAddress, deliveryAddress, vehicleType = "bike" } = body;

    if (!pickupAddress || !deliveryAddress) {
      return NextResponse.json(
        { error: "pickupAddress and deliveryAddress are required" },
        { status: 400 }
      );
    }

    // Call backend shipping endpoint
    const response = await apiClient.post<any>('/api/v1/shipping/quote', {
      pickupAddress,
      deliveryAddress,
      vehicleType,
    });

    return NextResponse.json({
      shipping: response.data.shipping,
      provider: response.data.provider,
      etaMinutes: response.data.etaMinutes,
      currency: response.data.currency,
    });
  } catch (error) {
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
