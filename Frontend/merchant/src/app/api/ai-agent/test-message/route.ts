import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/ai-agent/test-message
 * Send test message to AI agent
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: { response?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/ai-agent/test-message`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send test message');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/ai-agent/test-message',
        operation: 'SEND_TEST_MESSAGE',
      }
    );
    return NextResponse.json(
      { error: 'Failed to send test message' },
      { status: 500 }
    );
  }
}
