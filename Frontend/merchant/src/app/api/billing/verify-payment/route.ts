import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// POST /api/billing/verify-payment - Verify payment and update subscription
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Call backend API to verify payment
    const result = await apiJson<{
      success: boolean;
      data?: { verified?: boolean; subscriptionId?: string };
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/billing/verify-payment`,
      {
        method: "POST",
        headers: { ...auth.headers },
        body: JSON.stringify({ reference }),
      }
    );

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/billing/verify-payment',
      operation: 'VERIFY_PAYMENT',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
