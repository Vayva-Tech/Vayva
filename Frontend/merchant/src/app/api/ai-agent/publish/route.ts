import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

// POST /api/ai-agent/publish - Publish agent profile changes live
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));

    const result = await apiJson<{ success: boolean }>(
      `${backendBase()}/api/ai-agent/publish`,
      {
        method: "POST",
        headers: {
          ...auth.headers,
          "x-user-id": auth.user.id,
        },
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/ai-agent/publish",
      operation: "PUBLISH_AI_AGENT",
    });
    return NextResponse.json(
      { error: "Failed to publish agent" },
      { status: 500 },
    );
  }
}
