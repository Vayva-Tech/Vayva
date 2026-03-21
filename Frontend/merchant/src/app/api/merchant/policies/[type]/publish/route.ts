// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const storeId = request.headers.get("x-store-id") || "";

    const result = await apiJson<{ success: boolean; policy?: any; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/merchant/policies/${type}/publish`,
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
    handleApiError(error, { endpoint: "/api/merchant/policies/:type/publish", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
