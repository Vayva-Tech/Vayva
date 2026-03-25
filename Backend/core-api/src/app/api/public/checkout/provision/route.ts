import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { Prisma, prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { PaystackService } from "@/lib/payment/paystack";
import {
  mapToStoreSubscriptionPlan,
  parsePublicPlanKey,
  publicCheckoutAmountNgn,
  slugifyStoreBase,
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

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const parsed: unknown = await req.json().catch(() => ({}));
  const body = isRecord(parsed) ? parsed : {};

  const reference = getString(body.reference)?.trim();
  if (!reference) {
    return NextResponse.json(
      { success: false, error: "Missing reference" },
      { status: 400 },
    );
  }

  const email = getString(body.email)?.toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { success: false, error: "Invalid email" },
      { status: 400 },
    );
  }

  const planKey = parsePublicPlanKey(getString(body.planKey) ?? "");
  if (!planKey) {
    return NextResponse.json(
      { success: false, error: "Invalid plan" },
      { status: 400 },
    );
  }

  const cycleRaw = (getString(body.billingCycle) ?? "monthly").toLowerCase();
  const billingCycle: PublicBillingCycle =
    cycleRaw === "quarterly" ? "quarterly" : "monthly";

  const amountKobo = Number(body.amount);
  const expectedNgn = publicCheckoutAmountNgn(planKey, billingCycle);
  const expectedKobo = expectedNgn * 100;

  if (!Number.isFinite(amountKobo) || amountKobo !== expectedKobo) {
    return NextResponse.json(
      { success: false, error: "Amount mismatch" },
      { status: 400 },
    );
  }

  const phone = (getString(body.phone) ?? "").trim();
  const storeName = (getString(body.storeName) ?? "").trim();
  if (storeName.length < 2) {
    return NextResponse.json(
      { success: false, error: "Invalid store name" },
      { status: 400 },
    );
  }

  const currency = (getString(body.currency) ?? "NGN").toUpperCase();

  // Security-critical: verify the Paystack reference server-side before provisioning.
  // This prevents "free provisioning" by calling this endpoint directly.
  try {
    const verified = await PaystackService.verifyTransaction(reference);
    const verifiedData = getObject((verified as unknown as Record<string, unknown>).data);

    const status = (getString(verifiedData.status) ?? "").toLowerCase();
    if (status !== "success") {
      return NextResponse.json(
        { success: false, error: "Payment not successful" },
        { status: 402, headers: { "Cache-Control": "no-store" } },
      );
    }

    const paidAmountKobo = getNumber(verifiedData.amount) ?? Number(verifiedData.amount);
    const paidCurrency = (getString(verifiedData.currency) ?? "NGN").toUpperCase();
    if (!Number.isFinite(paidAmountKobo) || paidAmountKobo !== expectedKobo) {
      return NextResponse.json(
        { success: false, error: "Paid amount mismatch" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (paidCurrency !== currency) {
      return NextResponse.json(
        { success: false, error: "Currency mismatch" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Bind the provision request to what we sent to Paystack at init time (metadata).
    const metadata = getObject(verifiedData.metadata);
    const metaEmail = (getString(metadata.email) ?? "").toLowerCase();
    const metaPlanKey = getString(metadata.planKey) ?? "";
    const metaBillingCycle = getString(metadata.billingCycle) ?? "";
    const metaStoreName = getString(metadata.storeName) ?? "";

    if (metaEmail && metaEmail !== email) {
      return NextResponse.json(
        { success: false, error: "Email mismatch" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (metaPlanKey && metaPlanKey.toUpperCase() !== planKey) {
      return NextResponse.json(
        { success: false, error: "Plan mismatch" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (
      metaBillingCycle &&
      metaBillingCycle.toLowerCase() !== billingCycle.toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, error: "Billing cycle mismatch" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (metaStoreName && metaStoreName.trim() !== storeName) {
      return NextResponse.json(
        { success: false, error: "Store name mismatch" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
  } catch (e: unknown) {
    logger.error("[public_checkout_provision] Paystack verification failed", e, {
      reference,
    });
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const existing = await prisma.paymentTransaction.findUnique({
    where: { reference },
    include: { store: { select: { id: true, name: true } } },
  });
  if (existing) {
    const meta = isRecord(existing.metadata) ? existing.metadata : {};
    return NextResponse.json(
      {
        success: true,
        data: {
          email: typeof meta.email === "string" ? meta.email : email,
          storeId: existing.storeId,
          storeName: existing.store.name,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const randomPassword = randomBytes(32).toString("hex");
  const hashedPassword = await hash(randomPassword, 10);
  const otpCode = Math.floor(100_000 + Math.random() * 900_000).toString();
  const otpExpiresAt = new Date();
  otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

  const { plan: storePlan, tier } = mapToStoreSubscriptionPlan(planKey);
  const slug = `${slugifyStoreBase(storeName)}-${Date.now().toString(36)}`;

  try {
    const { user, store } = await prisma.$transaction(async (tx) => {
      let userRow = await tx.user.findUnique({ where: { email } });
      if (!userRow) {
        const localPart = email.split("@")[0] ?? "merchant";
        const firstName = localPart.slice(0, 49) || "Merchant";
        userRow = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName: "Customer",
            phone: phone || null,
            isEmailVerified: false,
          },
        });
      } else if (phone) {
        userRow = await tx.user.update({
          where: { id: userRow.id },
          data: { phone },
        });
      }

      const storeRow = await tx.store.create({
        data: {
          name: storeName,
          slug,
          plan: storePlan,
          tier,
          onboardingCompleted: false,
          onboardingLastStep: "welcome",
        },
      });

      await tx.membership.create({
        data: {
          userId: userRow.id,
          storeId: storeRow.id,
          role_enum: "OWNER",
          status: "ACTIVE",
        },
      });

      await tx.paymentTransaction.create({
        data: {
          storeId: storeRow.id,
          reference,
          provider: "paystack",
          amount: expectedNgn,
          currency,
          status: "SUCCESS",
          type: "MARKETING_CHECKOUT",
          metadata: {
            email,
            planKey,
            billingCycle,
            phone,
            storeName,
          },
        },
      });

      await tx.otpCode.create({
        data: {
          identifier: email,
          code: otpCode,
          type: "EMAIL_VERIFICATION",
          expiresAt: otpExpiresAt,
        },
      });

      await tx.merchantOnboarding.create({
        data: {
          storeId: storeRow.id,
          currentStepKey: "welcome",
          completedSteps: [],
          data: {
            business: {
              name: storeName,
              storeName,
              email,
            },
            user: {
              firstName: userRow.firstName,
              lastName: userRow.lastName,
            },
          },
        },
      });

      const starterAiPlan = await tx.aiPlan.findUnique({
        where: { name: "STARTER" },
      });
      if (starterAiPlan) {
        const now = new Date();
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        await tx.merchantAiSubscription.create({
          data: {
            storeId: storeRow.id,
            planId: starterAiPlan.id,
            planKey: "STARTER",
            periodStart: now,
            periodEnd: expiry,
            trialExpiresAt: expiry,
            status: "TRIAL_ACTIVE",
          },
        });
        await tx.merchantAiProfile.create({
          data: {
            storeId: storeRow.id,
            agentName: `${storeName} Assistant`,
            tonePreset: "Friendly",
          },
        });
      }

      return { user: userRow, store: storeRow };
    });

    try {
      const { ResendEmailService } = await import("@/lib/email/resend");
      await ResendEmailService.sendOTPEmail(
        user.email,
        otpCode,
        user.firstName ?? "there",
      );
    } catch (e: unknown) {
      logger.warn("OTP email failed", "public_checkout_provision", { error: e });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          email: user.email,
          storeId: store.id,
          storeName: store.name,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const tx = await prisma.paymentTransaction.findUnique({
        where: { reference },
        include: { store: { select: { id: true, name: true } } },
      });
      if (tx) {
        const meta = isRecord(tx.metadata) ? tx.metadata : {};
        return NextResponse.json(
          {
            success: true,
            data: {
              email: typeof meta.email === "string" ? meta.email : email,
              storeId: tx.storeId,
              storeName: tx.store.name,
            },
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
    }
    logger.error("Provisioning failed", e, { scope: "public_checkout_provision" });
    return NextResponse.json(
      { success: false, error: "Provisioning failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
