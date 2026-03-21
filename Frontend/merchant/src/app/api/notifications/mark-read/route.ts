import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/notifications/mark-read
 * Mark notification as read
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/notifications/mark-read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationId }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to mark notification as read');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/notifications/mark-read',
        operation: 'MARK_NOTIFICATION_READ',
      }
    );
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
