import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/socials/instagram/status
 * Get Instagram connection status
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: { connected?: boolean; accountInfo?: any };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/socials/instagram/status`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch Instagram status');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/socials/instagram/status',
        operation: 'GET_INSTAGRAM_STATUS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch Instagram status' },
      { status: 500 }
    );
  }
}
