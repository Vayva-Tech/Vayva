import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/merchant/dashboard/activation-progress
 * Get merchant activation progress
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/dashboard/activation-progress`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch activation progress');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/merchant/dashboard/activation-progress',
        operation: 'GET_ACTIVATION_PROGRESS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch activation progress' },
      { status: 500 }
    );
  }
}
