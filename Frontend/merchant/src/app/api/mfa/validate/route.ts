import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/mfa/validate
 * Validate MFA token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: { valid?: boolean };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/mfa/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to validate MFA');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/mfa/validate',
        operation: 'VALIDATE_MFA',
      }
    );
    return NextResponse.json(
      { error: 'Failed to validate MFA' },
      { status: 500 }
    );
  }
}
