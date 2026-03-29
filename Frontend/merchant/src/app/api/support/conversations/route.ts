import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();
    
    // Forward relevant query parameters
    for (const [key, value] of searchParams.entries()) {
      if (value) {
        queryParams.set(key, value);
      }
    }

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/support/conversations` + (queryParams.toString() ? `?${queryParams}` : ""),
      { headers: auth.headers }
    );

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, { endpoint: "/support/conversations/route.ts", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
