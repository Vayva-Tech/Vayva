import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/billing/upgrade - Get upgrade options and current billing status
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: { plans: Array<{ id: string; name: string; price: number }>; currentPlan?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/billing/upgrade`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/billing/upgrade",
      operation: "GET_UPGRADE_OPTIONS",
    });
    return NextResponse.json(
      { error: "Failed to fetch upgrade options" },
      { status: 500 },
    );
  }
}
