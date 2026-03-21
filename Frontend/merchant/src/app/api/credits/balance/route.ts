import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/credits/balance
 * Fetch the merchant's monthly credit balance and usage.
 * Used by CreditBalanceWidget.tsx
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      monthlyCredits: number;
      usedCredits: number;
      remainingCredits: number;
      resetDate: string | null;
      plan: string;
    }>(`${process.env.BACKEND_API_URL}/api/credits/balance`);

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/credits/balance",
      operation: "GET_CREDITS_BALANCE",
    });
    return NextResponse.json(
      { error: "Failed to fetch credit balance" },
      { status: 500 }
    );
  }
}
