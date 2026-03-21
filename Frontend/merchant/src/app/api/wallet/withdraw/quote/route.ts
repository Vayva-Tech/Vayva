// @ts-nocheck
import { NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { amount?: number };
    const amount = Number(body?.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    // Calculate withdrawal quote via backend API
    const result = await apiJson<{
      success: boolean;
      data?: { amount?: number; fee?: number; netAmount?: number };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/wallet/withdraw/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to calculate withdrawal quote');
    }

    return NextResponse.json({
      amount: result.data?.amount || amount,
      fee: result.data?.fee || 0,
      netAmount: result.data?.netAmount || (amount - (result.data?.fee || 0)),
      currency: "NGN",
      estimatedArrival: "within 24 hours",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/wallet/withdraw/quote", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
