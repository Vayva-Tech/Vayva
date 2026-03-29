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
    const result = await apiJson<{
      domains: Array<{
        id: string;
        domain: string;
        status: string;
        createdAt: Date;
      }>;
    }>(
      `${process.env.BACKEND_API_URL}/api/domains`,
      {
        headers: auth.headers,
      }
    );
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, { endpoint: "/domains", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json().catch(() => ({}));
    const inputDomain = String(body?.domain || "");
    if (!inputDomain) {
      return NextResponse.json({ error: "domain required" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const result = await apiJson<{
      domain?: { id: string; domain: string; status: string };
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/domains`,
      {
        method: "POST",
        headers: { ...auth.headers },
        body: JSON.stringify({ domain: inputDomain }),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/domains", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
