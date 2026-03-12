import { NextRequest, NextResponse } from "next/server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import {
  prisma,
  AppRole,
} from "@vayva/db";
import bcrypt from "bcryptjs";
import { PaystackService } from "@/lib/payment/paystack";
import { getPlanPrice, type PlanKey } from "@/lib/billing/plans";
import { ResendEmailService } from "@/lib/email/resend";

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
      return NextResponse.json(apiError(ApiErrorCode.VALIDATION_ERROR, "Missing reference"), { status: 400 });
    }

    // If we already processed this reference, return idempotently
    const existingTx = await prisma.paymentTransaction.findUnique({
      where: { reference },
      select: {
        storeId: true,
        metadata: true,
        store: { select: { name: true } },
      },
    });

    if (existingTx?.storeId) {
      const meta = isRecord(existingTx.metadata) ? existingTx.metadata : {};
      const email = typeof meta.email === "string" ? meta.email : "";
      const planKey = typeof meta.planKey === "string" ? meta.planKey : "";
      const plan = isPlanKey(planKey) ? planKey.toLowerCase() : "starter";
      return NextResponse.json(
        {
          success: true,
          data: {
            email,
            storeId: existingTx.storeId,
            storeName: existingTx.store?.name || "Your store",
            planKey: plan,
          },
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const verified = await PaystackService.verifyTransaction(reference);
    const verifiedData = isRecord(verified.data) ? verified.data : {};

    if (verifiedData.status !== "success") {
      return NextResponse.json(apiError(ApiErrorCode.VALIDATION_ERROR, "Payment not successful"), { status: 400 });
    }

    const metadata = isRecord(verifiedData.metadata) ? verifiedData.metadata : {};
    const planKeyRaw = typeof metadata.planKey === "string" ? metadata.planKey : "";
    const emailRaw = typeof metadata.email === "string" ? metadata.email : "";
    const phoneRaw = typeof metadata.phone === "string" ? metadata.phone : "";
    const storeNameRaw = typeof metadata.storeName === "string" ? metadata.storeName : "";

    const planKey = planKeyRaw.trim().toUpperCase();
    if (!isPlanKey(planKey) || planKey === "FREE") {
      return NextResponse.json(apiError(ApiErrorCode.VALIDATION_ERROR, "Invalid plan metadata"), { status: 400 });
    }

    const email = emailRaw.toLowerCase().trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(apiError(ApiErrorCode.VALIDATION_ERROR, "Invalid email metadata"), { status: 400 });
    }

    const amountKobo = Number(verifiedData.amount || 0);
    const expectedAmountNgn = getPlanPrice(planKey, "monthly");
    const expectedAmountKobo = expectedAmountNgn * 100;

    if (!Number.isFinite(amountKobo) || amountKobo !== expectedAmountKobo) {
      return NextResponse.json(apiError(ApiErrorCode.VALIDATION_ERROR, "Amount mismatch"), { status: 400 });
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // User
      let user = await tx.user.findUnique({
        where: { email },
        select: { id: true, firstName: true },
      });

      if (!user) {
        const randomPassword = Math.random().toString(36) + Date.now().toString(36);
        const passwordHash = await bcrypt.hash(randomPassword, 12);
        user = await tx.user.create({
          data: {
            email,
            password: passwordHash,
            phone: phoneRaw ? String(phoneRaw).trim() : null,
            firstName: null,
            lastName: null,
            isEmailVerified: false,
          },
          select: { id: true, firstName: true },
        });
      }

      // Store
      const baseSlug = slugify(storeNameRaw || "store");
      let slug = baseSlug;
      for (let i = 0; i < 10; i++) {
        const exists = await tx.store.findUnique({ where: { slug }, select: { id: true } });
        if (!exists) break;
        slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      }

      const store = await tx.store.create({
        data: {
          name: storeNameRaw || "Vayva Store",
          slug,
          plan: planKey === "PRO" ? "PRO" : "STARTER",
          onboardingStatus: "NOT_STARTED",
          onboardingLastStep: "START",
          onboardingCompleted: false,
          contacts: { phone: phoneRaw ? String(phoneRaw).trim() : undefined },
          kycStatus: "NOT_STARTED" as any,
        },
        select: { id: true, name: true },
      });

      // Membership
      await tx.membership.create({
        data: {
          userId: user.id,
          storeId: store.id,
          role_enum: AppRole.OWNER,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      // Subscription
      await tx.subscription.upsert({
        where: { storeId: store.id },
        update: {
          planKey,
          status: "ACTIVE",
          provider: "PAYSTACK",
          currentPeriodStart: now,
          currentPeriodEnd: addMonths(now, 1),
          cancelAtPeriodEnd: false,
        },
        create: {
          storeId: store.id,
          planKey,
          status: "ACTIVE",
          provider: "PAYSTACK",
          currentPeriodStart: now,
          currentPeriodEnd: addMonths(now, 1),
          cancelAtPeriodEnd: false,
        },
      });

      // Payment transaction record (idempotency)
      await tx.paymentTransaction.create({
        data: {
          storeId: store.id,
          reference,
          provider: "PAYSTACK",
          amount: (amountKobo / 100).toFixed(2),
          currency: String(verifiedData.currency || "NGN"),
          status: "SUCCESS",
          type: "SUBSCRIPTION",
          metadata: {
            email,
            planKey,
            phone: phoneRaw,
          },
        },
        select: { id: true },
      });

      // OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const otpIdentifier = `verify_email:${email}`;

      await tx.otpCode.updateMany({
        where: {
          identifier: otpIdentifier,
          type: "EMAIL_VERIFY",
          isUsed: false,
        },
        data: { isUsed: true },
      });

      await tx.otpCode.create({
        data: {
          identifier: otpIdentifier,
          code: otpCode,
          type: "EMAIL_VERIFY",
          expiresAt: otpExpiresAt,
        },
      });

      // Best-effort email
      await ResendEmailService.sendOTPEmail(email, otpCode, user.firstName || "Merchant");

      return { email, storeId: store.id, storeName: store.name };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          email: result.email,
          storeId: result.storeId,
          storeName: result.storeName,
          planKey: planKey.toLowerCase(),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Payment verification failed"),
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
