// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";

    const result = await apiJson<{
      success: boolean;
      data?: { analytics?: any };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/whatsapp/analytics`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch WhatsApp analytics");
    }

    return NextResponse.json({ analytics: result.data?.analytics });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/merchant/whatsapp/analytics",
      operation: "GET_WHATSAPP_ANALYTICS",
    });
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp analytics" },
      { status: 500 }
    );
  }
}
