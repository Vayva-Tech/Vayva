import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

function isValidPolicyTypeParam(v: string): boolean {
  return /^[a-z0-9_-]{1,64}$/i.test(v);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    if (!type || !isValidPolicyTypeParam(type)) {
      return NextResponse.json({ error: "Invalid policy type" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<unknown>(
      `${backendBase()}/api/merchant/policies/${encodeURIComponent(type)}`,
      {
        headers: auth.headers,
      }
    );
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/merchant/policies/:type",
      operation: "GET",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    if (!type || !isValidPolicyTypeParam(type)) {
      return NextResponse.json({ error: "Invalid policy type" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));
    const result = await apiJson<unknown>(
      `${backendBase()}/api/merchant/policies/${encodeURIComponent(type)}`,
      {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/merchant/policies/:type",
      operation: "POST",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
