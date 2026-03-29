import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PLANS, PlanKey } from "@/lib/billing/plans";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      plan_slug: string;
      billing_cycle?: "monthly" | "quarterly";
      payment_method?: "card" | "bank_transfer";
    };
    const { plan_slug, billing_cycle = "monthly", payment_method = "card" } = body;

    const planKey = plan_slug.toUpperCase() as PlanKey;
    if (!(planKey in PLANS)) {
      return NextResponse.json({ error: "Invalid Plan" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      checkout_url: string;
      reference: string;
    }>(`${backendBase()}/api/billing/subscribe`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({
        plan_slug,
        billing_cycle,
        payment_method,
      }),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/merchant/billing/subscribe",
      operation: "CREATE_SUBSCRIPTION",
    });
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
