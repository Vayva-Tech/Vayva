import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/merchant/addons
 * Get available addons for merchant
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/addons`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch addons');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/merchant/addons',
        operation: 'GET_ADDONS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch addons' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/merchant/addons
 * Activate addon for merchant
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
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/addons`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to activate addon');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/merchant/addons',
        operation: 'ACTIVATE_ADDON',
      }
    );
    return NextResponse.json(
      { error: 'Failed to activate addon' },
      { status: 500 }
    );
  }
}
