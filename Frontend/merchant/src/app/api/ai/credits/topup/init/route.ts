import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/ai/credits/topup/init
 * Proxies core-api AI top-up init (Paystack).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const res = await fetch(buildBackendUrl("/api/ai/credits/topup/init"), {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/ai/credits/topup/init",
      operation: "AI_TOPUP_INIT",
    });
    return NextResponse.json({ error: "Failed to initialize AI top-up" }, { status: 500 });
  }
}

