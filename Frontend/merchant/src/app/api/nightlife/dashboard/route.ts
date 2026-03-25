import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

/** GET /api/nightlife/dashboard — proxy to core-api (store-scoped) */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const suffix = qs ? `?${qs}` : "";

    const data = await apiJson<unknown>(
      `${backendBase()}/api/nightlife/dashboard${suffix}`,
      { headers: auth.headers },
    );

    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/nightlife/dashboard",
      operation: "GET_NIGHTLIFE_DASHBOARD",
    });
    return NextResponse.json(
      { error: "Failed to fetch nightlife dashboard" },
      { status: 500 },
    );
  }
}
