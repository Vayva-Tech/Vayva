import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/legal/cases - Get all legal cases
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const priority = searchParams.get("priority");

    // Fetch legal cases via backend API
    const params: Record<string, string> = { limit: String(limit), offset: String(offset) };
    if (status) params.status = status;
    if (clientId) params.clientId = clientId;
    if (priority) params.priority = priority;
    
    const response = await apiJson(`${process.env.BACKEND_API_URL}/api/legal/cases?${new URLSearchParams(params)}`, {
      method: 'GET',
      headers: auth.headers,
    });

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/legal/cases",
      operation: "GET_LEGAL_CASES",
    });
    return NextResponse.json(
      { error: "Failed to fetch legal cases" },
      { status: 500 }
    );
  }
}
