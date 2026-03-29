import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);
    const status = searchParams.get("status")?.toLowerCase() || "all";

    // Fetch support tickets via backend API
    const params: Record<string, string> = { limit: String(limit), status };
    
    const response = await apiJson(`${process.env.BACKEND_API_URL}/api/merchant/support/tickets?${new URLSearchParams(params)}`, {
      method: 'GET',
      headers: auth.headers,
    });

    return NextResponse.json(response.data || [], {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/merchant/support/tickets", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
