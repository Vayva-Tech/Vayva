import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/finance/metrics
 * Fetch financial metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/finance/metrics?period=${period}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch finance metrics');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/finance/metrics',
        operation: 'GET_FINANCE_METRICS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch finance metrics' },
      { status: 500 }
    );
  }
}
