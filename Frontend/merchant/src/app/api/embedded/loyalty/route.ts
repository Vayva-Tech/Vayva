import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/embedded/loyalty${query ? `?${query}` : ""}`,
      { headers: auth.headers }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/embedded/loyalty", operation: "GET" });
    return NextResponse.json({ error: "Failed to fetch loyalty data" }, { status: 500 });
  }
}
