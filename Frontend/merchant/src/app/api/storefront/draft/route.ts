import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/storefront/draft
 * Get the current storefront draft
 */
export async function GET(request: NextRequest) {
  try {
    // Call backend API using apiJson
    const result = await apiJson<{
      success: boolean;
      data?: { draft?: any };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/storefront/draft`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch draft');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/storefront/draft',
      operation: 'GET_DRAFT',
    });
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/storefront/draft
 * Save storefront draft
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: { versionId?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/storefront/draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to save draft');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/storefront/draft',
      operation: 'SAVE_DRAFT',
    });
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}
