import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/trash-bin
 * Fetch deleted items from trash bin
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/trash-bin?limit=${limit}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch trash bin items');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/trash-bin',
        operation: 'GET_TRASH_BIN',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch trash bin items' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trash-bin/restore
 * Restore item from trash bin
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
    }>(`${process.env.BACKEND_API_URL}/api/trash-bin/restore`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to restore item');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/trash-bin/restore',
        operation: 'RESTORE_FROM_TRASH',
      }
    );
    return NextResponse.json(
      { error: 'Failed to restore item' },
      { status: 500 }
    );
  }
}
