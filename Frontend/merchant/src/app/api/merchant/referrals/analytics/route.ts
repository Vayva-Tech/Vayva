// @ts-nocheck
/**
 * Referral Analytics API Route
 * GET /api/merchant/referrals/analytics - Get referral program analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";

    const result = await apiJson<{
      success: boolean;
      analytics?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/referrals/analytics`, {
      headers: { "x-store-id": storeId },
    });

    return NextResponse.json({ analytics: result.analytics ?? result });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/merchant/referrals/analytics",
      operation: "GET_REFERRALS",
    });
    return NextResponse.json(
      { error: "Failed to fetch referral analytics" },
      { status: 500 }
    );
  }
}
