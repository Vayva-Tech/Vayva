import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/export/products
 * Export products to CSV/Excel
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: { downloadUrl?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/export/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to export products');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/export/products',
        operation: 'EXPORT_PRODUCTS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to export products' },
      { status: 500 }
    );
  }
}
