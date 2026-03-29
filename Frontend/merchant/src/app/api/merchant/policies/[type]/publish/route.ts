import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

function isValidPolicyTypeParam(v: string): boolean {
  return /^[a-z0-9_-]{1,64}$/i.test(v);
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

    const result = await apiJson<{
      success: boolean;
      policy?: unknown;
      error?: string;
    }>(`${backendBase()}/api/merchant/policies/${encodeURIComponent(type)}/publish`, {
      method: "POST",
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/merchant/policies/:type/publish",
      operation: "POST",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
