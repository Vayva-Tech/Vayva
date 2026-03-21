import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: { count?: number };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/notifications/unread-count`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch unread count');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/notifications/unread-count',
        operation: 'GET_UNREAD_COUNT',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
