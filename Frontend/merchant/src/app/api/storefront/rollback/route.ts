import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/storefront/rollback
 * Rollback storefront to previous version
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json(
        { error: 'Version ID is required' },
        { status: 400 }
      );
    }

    // Call backend API using apiJson to rollback storefront
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/storefront/rollback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ versionId }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to rollback storefront');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/storefront/rollback',
        operation: 'ROLLBACK_STOREFRONT',
      }
    );
    return NextResponse.json(
      { error: 'Failed to rollback storefront' },
      { status: 500 }
    );
  }
}
