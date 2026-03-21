import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/merchant/autopilot/feed
 * Get autopilot activity feed
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/autopilot/feed?limit=${limit}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch autopilot feed');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/merchant/autopilot/feed',
        operation: 'GET_AUTOPILOT_FEED',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch autopilot feed' },
      { status: 500 }
    );
  }
}
