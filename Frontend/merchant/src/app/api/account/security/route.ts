import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson<{
      mfaEnabled: boolean;
      sessions: Array<{
        id: string;
        device: string;
        location: string;
        lastActive: Date;
        isCurrent: boolean;
      }>;
    }>(`${process.env.BACKEND_API_URL}/api/account/security`, {
      headers: auth.headers,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/account/security",
      operation: "GET_SECURITY_SETTINGS",
    });
    return NextResponse.json(
      { error: "Failed to fetch security settings" },
      { status: 500 }
    );
  }
}
