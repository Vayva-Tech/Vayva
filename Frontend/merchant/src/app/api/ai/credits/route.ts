import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/ai/credits
 * Fetch the merchant's AI credit summary.
 * Used by use-ai-credits.ts hook
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: {
        totalCreditsPurchased: number;
        creditsRemaining: number;
        creditsUsed: number;
        percentageUsed: number;
        isLowCredit: boolean;
        estimatedRequestsRemaining: number;
        showAlert: boolean;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/ai/credits`);

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/ai/credits",
      operation: "GET_AI_CREDITS",
    });
    return NextResponse.json(
      { error: "Failed to fetch AI credits" },
      { status: 500 }
    );
  }
}
