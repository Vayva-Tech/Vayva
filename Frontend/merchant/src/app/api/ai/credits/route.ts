import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/ai/credits
 * Fetch the merchant's AI credit summary.
 * Used by use-ai-credits.ts hook
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    }>(`${process.env.BACKEND_API_URL}/api/ai/credits`, {
      headers: auth.headers,
    });

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
