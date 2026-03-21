// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";

    const result = await apiJson<{ success: boolean; readiness?: any; message?: string; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/merchant/store/publish/go-live`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/store/publish/go-live", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
