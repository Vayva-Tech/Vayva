import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/forecasting
 * Fetch forecasting data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/forecasting?period=${period}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch forecasting data');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/forecasting',
        operation: 'GET_FORECASTING',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch forecasting data' },
      { status: 500 }
    );
  }
}
