import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/merchant/approvals/[id]/approve
 * Approve merchant application
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Approval ID is required' },
        { status: 400 }
      );
    }

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/approvals/${id}/approve`, {
      method: "POST",
      headers: { ...auth.headers },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to approve merchant');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/merchant/approvals/[id]/approve',
        operation: 'APPROVE_MERCHANT',
      }
    );
    return NextResponse.json(
      { error: 'Failed to approve merchant' },
      { status: 500 }
    );
  }
}
