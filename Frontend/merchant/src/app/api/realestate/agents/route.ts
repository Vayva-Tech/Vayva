import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/realestate/agents - Get real estate agents
export async function GET(request: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit") || "50";
    const page = searchParams.get("page") || "1";

    const queryParams = new URLSearchParams();
    if (status) queryParams.set("status", status);
    queryParams.set("limit", limit);
    queryParams.set("page", page);

    const result = await apiJson<{
      success: boolean;
      data?: {
        agents: unknown[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      };
      error?: string;
    }>(`${buildBackendUrl("/api/realestate/agents")}?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/realestate/agents",
      operation: "GET_AGENTS",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
