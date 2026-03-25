import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/products/import
 * Import products via backend API
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
      data?: { imported?: number; errors?: any[] };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/products/import`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to import products');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/products/import',
        operation: 'IMPORT_PRODUCTS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    );
  }
}
