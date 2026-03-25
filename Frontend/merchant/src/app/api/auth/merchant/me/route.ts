import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const result = await apiJson<Record<string, unknown>>(
      buildBackendUrl("/api/auth/merchant/me"),
      { headers: auth.headers, cache: "no-store" }
    );

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/auth/merchant/me",
      operation: "GET_MERCHANT_PROFILE",
    });
    return NextResponse.json(
      { error: "Failed to fetch merchant profile" },
      { status: 500 }
    );
  }
}
