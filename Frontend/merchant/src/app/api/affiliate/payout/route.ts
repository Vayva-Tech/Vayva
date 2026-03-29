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
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/affiliate/payout${query ? `?${query}` : ""}`,
      { headers: auth.headers }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/affiliate/payout", operation: "GET" });
    return NextResponse.json({ error: "Failed to fetch payout history" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/affiliate/payout`,
      {
        method: "POST",
        headers: { ...auth.headers },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/affiliate/payout", operation: "POST" });
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
  }
}
