import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/ai/credits/topup
 * Purchase additional AI credits.
 * Used by use-ai-credits.ts hook (purchaseCredits)
 * Body: { creditsAmount: number, paymentReference?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await apiJson<{
      success: boolean;
      data?: {
        creditsAdded: number;
        newBalance: number;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/ai/credits/topup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Top-up failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/ai/credits/topup",
      operation: "POST_AI_CREDITS_TOPUP",
    });
    return NextResponse.json(
      { error: "Failed to process credit top-up" },
      { status: 500 }
    );
  }
}
