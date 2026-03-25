import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error-handler";
import { env } from "@/lib/config/env";
import { getQuarterlyTotalNgn, PLANS } from "@/config/pricing";

const PAID_PLAN_IDS = new Set(["starter", "pro", "pro_plus"]);

function planIdToConfigKey(planId: string): "STARTER" | "PRO" | "PRO_PLUS" | null {
  if (planId === "starter") return "STARTER";
  if (planId === "pro") return "PRO";
  if (planId === "pro_plus") return "PRO_PLUS";
  return null;
}

function expectedAmountNgn(planId: string, duration: "monthly" | "three_month"): number | null {
  const configKey = planIdToConfigKey(planId);
  if (!configKey) return null;
  const plan = PLANS.find((p) => p.key === configKey);
  if (!plan) return null;
  return duration === "three_month"
    ? getQuarterlyTotalNgn(plan.monthlyAmount)
    : plan.monthlyAmount;
}

/**
 * POST /api/subscriptions/initiate
 * Public subscription checkout: initializes Paystack via core-api public marketing checkout
 * (same contract as marketing /api/public/checkout/init).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: "Billing is not configured" },
        { status: 503 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const planId = typeof body.planId === "string" ? body.planId.toLowerCase().trim() : "";
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    const email = emailRaw.toLowerCase();
    const storeName = typeof body.storeName === "string" ? body.storeName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const duration =
      body.duration === "three_month" ? ("three_month" as const) : ("monthly" as const);
    const clientAmount =
      typeof body.amount === "number" && Number.isFinite(body.amount)
        ? Math.round(body.amount)
        : NaN;

    if (!PAID_PLAN_IDS.has(planId)) {
      return NextResponse.json({ success: false, message: "Invalid plan" }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
    }

    if (storeName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Enter your business name" },
        { status: 400 },
      );
    }

    const expected = expectedAmountNgn(planId, duration);
    if (expected == null || clientAmount !== expected) {
      return NextResponse.json(
        { success: false, message: "Amount does not match selected plan — refresh and try again" },
        { status: 400 },
      );
    }

    const billingCycle = duration === "three_month" ? "quarterly" : "monthly";

    const appBase = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    const callback_url = `${appBase}/subscription/payment/complete`;

    const upstream = await fetch(`${backendUrl}/api/public/checkout/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planKey: planId,
        billingCycle,
        email,
        phone,
        storeName,
        callback_url,
      }),
    });

    const json = (await upstream.json().catch(() => null)) as
      | {
          success?: boolean;
          error?: string;
          data?: {
            access_code?: string;
            reference?: string;
            authorization_url?: string;
          };
        }
      | null;

    if (!upstream.ok || !json?.success || !json.data) {
      const msg =
        (json && typeof json.error === "string" && json.error) ||
        `Checkout init failed (${upstream.status})`;
      return NextResponse.json({ success: false, message: msg }, { status: upstream.ok ? 400 : 502 });
    }

    const { access_code, reference, authorization_url } = json.data;
    const checkoutUrl =
      typeof authorization_url === "string" && authorization_url.length > 0
        ? authorization_url
        : typeof access_code === "string" && access_code.length > 0
          ? `https://checkout.paystack.com/${access_code}`
          : undefined;

    if (!checkoutUrl || typeof reference !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid response from payment provider" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        authorization_url: checkoutUrl,
        reference,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/subscriptions/initiate",
      operation: "POST",
    });
    return NextResponse.json(
      { success: false, message: "Failed to start checkout" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
