import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));
    let amount = NaN;
    if (body !== null && typeof body === "object" && "amount" in body) {
      const raw = (body as { amount?: unknown }).amount;
      if (typeof raw === "number") amount = raw;
      else if (typeof raw === "string") amount = Number(raw);
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const result = await apiJson<{
      success: boolean;
      data?: { amount?: number; fee?: number; netAmount?: number };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/wallet/withdraw/quote`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({ amount }),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to calculate withdrawal quote");
    }

    return NextResponse.json(
      {
        amount: result.data?.amount || amount,
        fee: result.data?.fee || 0,
        netAmount:
          result.data?.netAmount || amount - (result.data?.fee || 0),
        currency: "NGN",
        estimatedArrival: "within 24 hours",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/wallet/withdraw/quote",
      operation: "POST_WITHDRAW_QUOTE",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
