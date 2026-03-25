import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson<{ pinSet: boolean }>(`${process.env.BACKEND_API_URL}/api/account/security/status`, {
      headers: auth.headers,
    });
    
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/account/security/status",
      operation: "GET_SECURITY_STATUS",
    });
    return NextResponse.json(
      { error: "Failed to fetch security status" },
      { status: 500 }
    );
  }
}
