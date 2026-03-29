import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/merchant/autopilot/evaluate
 * Proxies core-api Autopilot evaluation.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    const base = process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
    const res = await fetch(`${base}/api/merchant/autopilot/evaluate`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/merchant/autopilot/evaluate",
      operation: "EVALUATE_AUTOPILOT",
    });
    return NextResponse.json(
      { error: "Failed to evaluate autopilot recommendations" },
      { status: 500 },
    );
  }
}
