import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/merchant/approvals/[id]/approve
 * Approve merchant application
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
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
      headers: {
        "Content-Type": "application/json",
      },
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
