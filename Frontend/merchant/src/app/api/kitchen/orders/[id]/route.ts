import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/kitchen/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update order status');
    }

    return NextResponse.json(result.data);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/kitchen/orders/[id]",
        operation: "UPDATE_ORDER_STATUS",
      }
    );
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
