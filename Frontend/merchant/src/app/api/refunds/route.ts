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
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Call backend API
      const queryParams = new URLSearchParams();
      if (status) queryParams.set("status", status);
      queryParams.set("limit", String(limit));
      queryParams.set("offset", String(offset));
      const result = await apiJson(`${buildBackendUrl("/refunds")}?${queryParams.toString()}`, {
        headers: auth.headers,
      });
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/refunds", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
