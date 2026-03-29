import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/ai/credits/topup/verify
 * Proxies core-api AI top-up verify (Paystack).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const res = await fetch(buildBackendUrl("/ai/credits/topup/verify"), {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/ai/credits/topup/verify",
      operation: "AI_TOPUP_VERIFY",
    });
    return NextResponse.json({ error: "Failed to verify AI top-up" }, { status: 500 });
  }
}

