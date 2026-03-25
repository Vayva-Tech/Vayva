import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/mfa/setup
 * Setup multi-factor authentication
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
      data?: { secret?: string; qrCodeUrl?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/mfa/setup`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to setup MFA');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/mfa/setup',
        operation: 'SETUP_MFA',
      }
    );
    return NextResponse.json(
      { error: 'Failed to setup MFA' },
      { status: 500 }
    );
  }
}
