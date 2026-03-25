import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const extensionId = record.extensionId;

    if (!extensionId || typeof extensionId !== "string") {
      return NextResponse.json({ error: "extensionId is required" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${backendBase()}/api/merchant/addons/renew`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({ extensionId }),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/addons/renew", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
