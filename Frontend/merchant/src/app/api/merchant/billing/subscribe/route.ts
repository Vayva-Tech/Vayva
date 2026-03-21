// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PLANS, PlanKey } from "@/lib/billing/plans";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json() as { plan_slug: string; billing_cycle?: "monthly" | "quarterly"; payment_method?: "card" | "bank_transfer" };
    const { plan_slug, billing_cycle = "monthly", payment_method = "card" } = body;

    const planKey = plan_slug.toUpperCase() as PlanKey;
    if (!(planKey in PLANS)) {
      return NextResponse.json({ error: "Invalid Plan" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      checkout_url: string;
      reference: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/billing/subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify({
          plan_slug,
          billing_cycle,
          payment_method,
        }),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/merchant/billing/subscribe",
        operation: "CREATE_SUBSCRIPTION",
      }
    );
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
