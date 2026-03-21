import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/storefront/url
 * Get the storefront URL for the current merchant
 */
export async function GET(request: NextRequest) {
  try {
    // Call backend API to get storefront URL
    const result = await apiJson<{
      success: boolean;
      data?: { url?: string; subdomain?: string; customDomain?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/storefront/url`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch storefront URL');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/storefront/url',
        operation: 'GET_STOREFRONT_URL',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch storefront URL' },
      { status: 500 }
    );
  }
}
