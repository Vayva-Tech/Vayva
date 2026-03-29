import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/billing/subscription - Get subscription status and plans
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: { plan: string; status: string; nextBillingDate?: Date; amount: number };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/billing/subscription`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/billing/subscription",
      operation: "GET_SUBSCRIPTION",
    });
    return NextResponse.json(
      { error: "Failed to fetch subscription details" },
      { status: 500 },
    );
  }
}
