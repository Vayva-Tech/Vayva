import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/whatsapp/instance/status
 * Get detailed WhatsApp instance status
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: { status?: string; connected?: boolean; lastSeen?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/whatsapp/instance/status`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch WhatsApp status');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/whatsapp/instance/status',
        operation: 'GET_WHATSAPP_STATUS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp status' },
      { status: 500 }
    );
  }
}
