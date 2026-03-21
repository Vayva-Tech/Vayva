import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/notifications/preferences
 * Get notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/notifications/preferences`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch notification preferences');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/notifications/preferences',
        operation: 'GET_NOTIFICATION_PREFERENCES',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/preferences
 * Update notification preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/notifications/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update notification preferences');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/notifications/preferences',
        operation: 'UPDATE_NOTIFICATION_PREFERENCES',
      }
    );
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
