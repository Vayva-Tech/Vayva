import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/security/login-history
 * Get login history logs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";
    
    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/security/login-history?limit=${limit}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch login history');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/security/login-history',
        operation: 'GET_LOGIN_HISTORY',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch login history' },
      { status: 500 }
    );
  }
}
