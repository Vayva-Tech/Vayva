import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json();
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/merchant/virtual-try-on/assets`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/virtual-try-on/assets", operation: "POST" });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/merchant/virtual-try-on/assets?${searchParams.toString()}`,
      { headers: auth.headers }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/virtual-try-on/assets", operation: "GET" });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
