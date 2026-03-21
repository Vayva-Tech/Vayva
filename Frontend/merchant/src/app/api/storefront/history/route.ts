import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/storefront/history
 * Get deployment history for the storefront
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());

    // Call backend API using apiJson to get deployment history
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/storefront/history?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch deployment history');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/storefront/history',
        operation: 'GET_DEPLOYMENT_HISTORY',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch deployment history' },
      { status: 500 }
    );
  }
}
