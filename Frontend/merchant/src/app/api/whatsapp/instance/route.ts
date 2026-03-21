import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/whatsapp/instance
 * Get WhatsApp instance status
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/whatsapp/instance`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch WhatsApp instance');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/whatsapp/instance',
        operation: 'GET_WHATSAPP_INSTANCE',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp instance' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/instance
 * Create or update WhatsApp instance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/whatsapp/instance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to manage WhatsApp instance');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/whatsapp/instance',
        operation: 'MANAGE_WHATSAPP_INSTANCE',
      }
    );
    return NextResponse.json(
      { error: 'Failed to manage WhatsApp instance' },
      { status: 500 }
    );
  }
}
