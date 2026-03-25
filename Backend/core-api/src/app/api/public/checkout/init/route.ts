import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { PaystackService } from "@/lib/payment/paystack";
import { logger } from "@/lib/logger";
import {
  parsePublicPlanKey,
  publicCheckoutAmountNgn,
  type PublicBillingCycle
} from "@/lib/public-marketing-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const parsed: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsed) ? parsed : {};

    const planRaw = getString(body.planKey) ?? "";
    const planKey = parsePublicPlanKey(planRaw);
    if (!planKey) {
      return NextResponse.json(
        { success: false, error: "Invalid plan" },
        { status: 400 },
      );
    }

    const cycleRaw = (getString(body.billingCycle) ?? "monthly").toLowerCase();
    const billingCycle: PublicBillingCycle =
      cycleRaw === "quarterly" ? "quarterly" : "monthly";

    const email = (getString(body.email) ?? "").toLowerCase().trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email" },
        { status: 400 },
      );
    }

    const storeName = (getString(body.storeName) ?? "").trim();
    if (storeName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Business name required" },
        { status: 400 },
      );
    }

    const phone = (getString(body.phone) ?? "").trim();

    const callbackUrl = getString(body.callback_url)?.trim();

    const amountNgn = publicCheckoutAmountNgn(planKey, billingCycle);
    const amountKobo = amountNgn * 100;
    const reference = `mkt_${randomBytes(14).toString("hex")}`;

    const metadata: Record<string, unknown> = {
      email,
      planKey,
      billingCycle,
      storeName,
      phone,
      custom_fields: [
        { display_name: "Business", variable_name: "storeName", value: storeName },
        { display_name: "Phone", variable_name: "phone", value: phone },
        { display_name: "Plan", variable_name: "planKey", value: planKey },
        {
          display_name: "Billing",
          variable_name: "billingCycle",
          value: billingCycle,
        },
      ],
    };

    const init = await PaystackService.initializeTransaction({
      email,
      amount: amountKobo,
      reference,
      metadata,
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          access_code: init.data.access_code,
          reference: init.data.reference,
          authorization_url: init.data.authorization_url,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    logger.error("[public_checkout_init]", e);
    return NextResponse.json(
      { success: false, error: "Failed to initialize payment" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
