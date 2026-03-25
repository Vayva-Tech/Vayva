import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    // Call backend API to fetch domain details
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson<{
      id: string | null;
      subdomain: string | null;
      customDomain: string | null;
      status: string;
      verificationToken: string | null;
      lastCheckedAt: string | null;
      lastError: string | null;
      sslEnabled: boolean;
    }>(`${process.env.BACKEND_API_URL}/api/account/domains`, {
      headers: auth.headers,
    });
    
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/account/domains",
      operation: "GET_DOMAINS",
    });
    throw error;
  }
}
