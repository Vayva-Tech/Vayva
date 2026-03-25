import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/customer/virtual-try-on
 * Process virtual try-on request
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
      data?: { imageUrl?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/customer/virtual-try-on`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to process virtual try-on');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/customer/virtual-try-on',
        operation: 'PROCESS_VIRTUAL_TRY_ON',
      }
    );
    return NextResponse.json(
      { error: 'Failed to process virtual try-on' },
      { status: 500 }
    );
  }
}
