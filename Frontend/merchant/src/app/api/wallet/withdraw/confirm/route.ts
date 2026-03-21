import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
    const withdrawalId = String(body.withdrawalId || "");
    const otpCode = String(body.otpCode || "");

    if (!withdrawalId) {
      return NextResponse.json({ error: "withdrawalId required" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    if (!otpCode) {
      return NextResponse.json({ error: "otpCode required" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const result = await apiJson<{
      success: boolean;
      data?: { success?: boolean; message?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/wallet/withdraw/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-store-id": storeId },
      body: JSON.stringify({ withdrawalId, otpCode }),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/wallet/withdraw/confirm", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
