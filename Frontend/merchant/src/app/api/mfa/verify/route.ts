import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/mfa/verify
 * Verify multi-factor authentication code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: { verified?: boolean };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to verify MFA');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/mfa/verify',
        operation: 'VERIFY_MFA',
      }
    );
    return NextResponse.json(
      { error: 'Failed to verify MFA' },
      { status: 500 }
    );
  }
}
