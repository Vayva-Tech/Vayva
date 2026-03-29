import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      currentPlan: {
        planKey: string;
        status: string;
        periodEnd: string | null;
        cancelAtPeriodEnd: boolean;
        trialEndsAt: string | null;
        gracePeriodEndsAt: string | null;
      };
      subscription: {
        status: string;
        periodEnd: string | null;
        cancelAtPeriodEnd: boolean;
        trialEndsAt: string | null;
        gracePeriodEndsAt: string | null;
      } | null;
      invoices: any[];
    }>("/api/v1/merchant/billing/status", {
      headers: { ...auth.headers },
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/merchant/billing/status",
      operation: "GET",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
