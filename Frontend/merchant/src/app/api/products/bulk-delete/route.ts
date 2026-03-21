// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/products/bulk-delete
 * Bulk delete products via backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids }: { ids: string[] } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No product IDs provided' },
        { status: 400 }
      );
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 products per batch' },
        { status: 400 }
      );
    }

    const result = await apiJson<{
      success: boolean;
      deleted: number;
      message?: string;
    }>(`${process.env.BACKEND_API_URL}/api/products/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete products');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/products/bulk-delete',
        operation: 'BULK_DELETE_PRODUCTS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to delete products' },
      { status: 500 }
    );
  }
}
