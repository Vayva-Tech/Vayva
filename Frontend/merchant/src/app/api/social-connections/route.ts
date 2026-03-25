import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

/**
 * GET /api/social-connections — proxy to core-api
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await apiJson<unknown>(`${backendBase()}/api/social-connections`, {
      headers: auth.headers,
    });

    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/social-connections",
      operation: "GET_SOCIAL_CONNECTIONS",
    });
    return NextResponse.json(
      { error: "Failed to fetch social connections" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/social-connections — proxy to core-api
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));
    const data = await apiJson<unknown>(`${backendBase()}/api/social-connections`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/social-connections",
      operation: "POST_SOCIAL_CONNECTIONS",
    });
    return NextResponse.json(
      { error: "Failed to connect social platform" },
      { status: 500 },
    );
  }
}
