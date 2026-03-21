import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/auth/webauthn/register-options
 * Get WebAuthn registration options
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/auth/webauthn/register-options`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch WebAuthn registration options');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/auth/webauthn/register-options',
        operation: 'GET_WEBAUTHN_REGISTER_OPTIONS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch WebAuthn registration options' },
      { status: 500 }
    );
  }
}
