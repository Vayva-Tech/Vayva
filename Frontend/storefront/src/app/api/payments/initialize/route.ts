import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference } = body;

    if (!reference || typeof reference !== "string") {
      return NextResponse.json(
        { error: "reference is required" },
        { status: 400 }
      );
    }

    // Call backend payment initialization endpoint
    const response = await apiClient.post<any>('/api/v1/payments/initialize', {
      reference,
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: response.data.authorizationUrl,
      reference: response.data.reference,
      accessCode: response.data.accessCode,
    });
  } catch (error) {
    console.error("[PAYMENTS_INITIALIZE] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
