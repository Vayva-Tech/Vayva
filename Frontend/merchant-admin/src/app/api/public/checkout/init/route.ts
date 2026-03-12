import { NextRequest, NextResponse } from "next/server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { PaystackService } from "@/lib/payment/paystack";
import { getPlanPrice, type BillingCycle, type PlanKey } from "@/lib/billing/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isPlanKey(value: string): value is PlanKey {
  return value === "FREE" || value === "STARTER" || value === "PRO";
}

export async function POST(req: NextRequest) {
  try {
    const parsed: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsed) ? parsed : {};

    const planKeyRaw = getString(body.planKey) || "";
    const email = getString(body.email);
    const phone = getString(body.phone);
    const storeName = getString(body.storeName);

    const planKey = planKeyRaw.trim().toUpperCase();
    if (!isPlanKey(planKey)) {
      return NextResponse.json(apiError(ApiErrorCode.VALIDATION_ERROR, "Invalid plan"), { status: 400 });
    }

    if (planKey === "FREE") {
      return NextResponse.json(apiError(ApiErrorCode.VALIDATION_ERROR, "Free plan does not require checkout"), { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(apiError(ApiErrorCode.VALIDATION_ERROR, "Invalid email"), { status: 400 });
    }

    if (!phone || phone.trim().length < 8) {
      return NextResponse.json(apiError(ApiErrorCode.VALIDATION_ERROR, "Invalid phone"), { status: 400 });
    }

    if (!storeName || storeName.trim().length < 2) {
      return NextResponse.json(apiError(ApiErrorCode.VALIDATION_ERROR, "Invalid store name"), { status: 400 });
    }

    const billingCycle: BillingCycle = "monthly";
    const amountNgn = getPlanPrice(planKey, billingCycle);
    const amountKobo = amountNgn * 100;

    const reference = `mkt_sub_${planKey.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const init = await PaystackService.initializeTransaction({
      email: email.toLowerCase(),
      amount: amountKobo,
      reference,
      metadata: {
        type: "marketing_subscription",
        planKey,
        billingCycle,
        storeName,
        phone,
        email: email.toLowerCase(),
      },
      channels: ["card", "bank_transfer", "bank", "ussd"],
    });

    const accessCode = isRecord(init.data) ? (init.data as any).access_code : undefined;

    if (!accessCode || typeof accessCode !== "string") {
      return NextResponse.json(apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Failed to initialize payment"), { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          access_code: accessCode,
          reference,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Failed to initialize checkout"),
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
