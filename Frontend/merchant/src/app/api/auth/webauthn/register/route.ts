import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/auth/webauthn/register
 * Register WebAuthn credential
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: { registered?: boolean };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/auth/webauthn/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to register WebAuthn');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/auth/webauthn/register',
        operation: 'REGISTER_WEBAUTHN',
      }
    );
    return NextResponse.json(
      { error: 'Failed to register WebAuthn' },
      { status: 500 }
    );
  }
}
