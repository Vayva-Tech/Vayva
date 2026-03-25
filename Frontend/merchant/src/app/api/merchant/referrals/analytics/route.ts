/**
 * Referral Analytics API Route
 * GET /api/merchant/referrals/analytics - Get referral program analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const result = await apiJson<{
      success: boolean;
      analytics?: unknown;
      error?: string;
    }>(buildBackendUrl("/api/merchant/referrals/analytics"), {
      headers: auth.headers,
    });

    return NextResponse.json({ analytics: result.analytics ?? result });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/merchant/referrals/analytics",
      operation: "GET_REFERRALS",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to fetch referral analytics" },
      { status: 500 }
    );
  }
}
