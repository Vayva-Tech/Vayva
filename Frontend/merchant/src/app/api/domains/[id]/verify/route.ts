import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      domain?: { id: string; domain: string; status: string };
      verified?: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/domains/${id}/verify`, {
      method: "POST",
      headers: auth.headers,
    });
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/domains/[id]/verify",
      operation: "POST_DOMAIN_VERIFY",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
