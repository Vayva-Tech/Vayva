import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const result = await apiJson(`${buildBackendUrl("/api/auth/merchant/me")}`, {
      headers: auth.headers,
      cache: "no-store",
    });
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/me/plan", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
