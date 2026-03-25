import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PaystackService } from "@/lib/payment/paystack";
import {
  getPlanPrice,
  type PlanKey,
  type BillingCycle,
} from "@/lib/billing/plans";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isPlanKey(value: string): value is PlanKey {
  return value === "FREE" || value === "STARTER" || value === "PRO" || value === "PRO_PLUS";
}

function parseBillingCycle(metadata: Record<string, unknown>): BillingCycle {
  const raw =
    (typeof metadata.billingCycle === "string" && metadata.billingCycle) ||
    (typeof metadata.billing_cycle === "string" && metadata.billing_cycle) ||
    "";
  if (raw.trim().toLowerCase() === "quarterly") return "quarterly";

  const cf = metadata.custom_fields;
  if (Array.isArray(cf)) {
    for (const item of cf) {
      if (
        typeof item === "object" &&
        item !== null &&
        "variable_name" in item &&
        "value" in item &&
        (item as { variable_name?: string }).variable_name === "billingCycle" &&
        typeof (item as { value?: string }).value === "string" &&
        (item as { value: string }).value.trim().toLowerCase() === "quarterly"
      ) {
        return "quarterly";
      }
    }
  }
  return "monthly";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "store";
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const parsed: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsed) ? parsed : {};

    const reference = getString(body.reference);
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // If we already processed this reference, check via backend
    const existingTx = await apiJson<{
        success: boolean;
        data?: {
          storeId?: string;
          metadata?: unknown;
          store?: { name?: string };
        };
        error?: string;
      }>(`${process.env.BACKEND_API_URL}/api/paymenttransaction/reference/${encodeURIComponent(reference)}`);

    if (existingTx?.data?.storeId) {
      const txData = existingTx.data;
      const meta = isRecord(txData.metadata) ? txData.metadata : {};
      const email = typeof meta.email === "string" ? meta.email : "";
      const planKeyNorm =
        (typeof meta.planKey === "string" ? meta.planKey : "").trim().toUpperCase();
      const plan = isPlanKey(planKeyNorm) ? planKeyNorm.toLowerCase() : "starter";
      return NextResponse.json(
        {
          success: true,
          data: {
            email,
            storeId: txData.storeId,
            storeName: txData.store?.name || "Your store",
            planKey: plan,
          },
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const verified = await PaystackService.verifyTransaction(reference);
    const verifiedData = isRecord(verified.data) ? verified.data : {};

    if (verifiedData.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

    const metadata = isRecord(verifiedData.metadata) ? verifiedData.metadata : {};
    const billingCycle = parseBillingCycle(metadata);
    const planKeyRaw = typeof metadata.planKey === "string" ? metadata.planKey : "";
    const emailRaw = typeof metadata.email === "string" ? metadata.email : "";
    const phoneRaw = typeof metadata.phone === "string" ? metadata.phone : "";
    const storeNameRaw = typeof metadata.storeName === "string" ? metadata.storeName : "";

    const planKey = planKeyRaw.trim().toUpperCase();
    if (!isPlanKey(planKey) || planKey === "FREE") {
      return NextResponse.json({ error: "Invalid plan metadata" }, { status: 400 });
    }

    const email = emailRaw.toLowerCase().trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email metadata" }, { status: 400 });
    }

    const amountKobo = Number(verifiedData.amount || 0);
    const expectedAmountNgn = getPlanPrice(planKey, billingCycle);
    const expectedAmountKobo = expectedAmountNgn * 100;

    if (!Number.isFinite(amountKobo) || amountKobo !== expectedAmountKobo) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Create account via backend API
    const result = await apiJson<{
      success: boolean;
      data?: { email: string; storeId: string; storeName: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/public/checkout/provision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email,
        phone: phoneRaw,
        storeName: storeNameRaw,
        planKey,
        billingCycle,
        amount: amountKobo,
        currency: String(verifiedData.currency || "NGN"),
      }),
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to provision account");
    }

    // OTP / welcome email is sent by the backend provision flow when applicable.

    return NextResponse.json(
      {
        success: true,
        data: {
          email: result.data.email,
          storeId: result.data.storeId,
          storeName: result.data.storeName,
          planKey: planKey.toLowerCase(),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/api/public/checkout/verify", operation: "POST" });
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
