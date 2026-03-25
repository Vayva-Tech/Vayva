import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/customers/summary
 * Fetch customer summary statistics
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson<{
      success?: boolean;
      error?: string;
      total: number;
      active: number;
      vip: number;
      averageOrderValue: number;
    }>(`${process.env.BACKEND_API_URL}/api/customers/summary`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/customers/summary',
        operation: 'GET_CUSTOMERS_SUMMARY',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch customer summary' },
      { status: 500 }
    );
  }
}
