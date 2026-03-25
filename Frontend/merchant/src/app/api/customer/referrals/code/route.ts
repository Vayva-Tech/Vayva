import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/customer/referrals/code
 * Get customer referral code
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: { code?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/customer/referrals/code`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch referral code');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/customer/referrals/code',
        operation: 'GET_REFERRAL_CODE',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch referral code' },
      { status: 500 }
    );
  }
}
