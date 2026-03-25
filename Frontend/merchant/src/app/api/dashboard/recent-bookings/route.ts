import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "5");

      const queryParams = new URLSearchParams();
      queryParams.set("limit", limit.toString());
      const result = await apiJson(`${buildBackendUrl("/api/dashboard/recent-bookings")}?${queryParams.toString()}`, {
        headers: auth.headers,
      });
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/dashboard/recent-bookings", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
