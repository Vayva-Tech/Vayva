import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session.server";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom, RateLimitError } from "@/lib/ratelimit";
import { apiError, ApiErrorCode, BusinessType } from "@vayva/shared";
import {
  formatPhoneNumber,
  isValidPhoneNumber,
  OTPMethod,
} from "@/lib/whatsapp-otp";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const parsedBody: unknown = await request.json().catch(() => ({}));
    const body: Record<string, unknown> = isRecord(parsedBody)
      ? parsedBody
      : {};
    // Rate Limit: Prevent brute forcing OTP (5 per 5 min)
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    try {
      await checkRateLimitCustom(ip, "verify_otp", 5, 300);
    } catch (e) {
      if (e instanceof RateLimitError) {
        return NextResponse.json(
          apiError(ApiErrorCode.RATE_LIMIT_EXCEEDED, "Rate limit exceeded"),
          { status: 429 },
        );
      }
      throw e;
    }
    const email = getString(body.email);
    const code = getString(body.code) || getString(body.otp);
    const otpMethod = (getString(body.method) || "EMAIL").toUpperCase() as OTPMethod;
    const isWhatsAppMethod = otpMethod === "WHATSAPP";

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        apiError(
          ApiErrorCode.VALIDATION_ERROR,
          "Email and verification code are required",
        ),
        { status: 400 },
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          include: {
            store: true,
            role: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json(
        apiError(ApiErrorCode.NOT_FOUND, "User not found"),
        { status: 404 },
      );
    }

    // For WhatsApp OTP, verify user has a phone number
    if (isWhatsAppMethod && !user.phone) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "No phone number on file"),
        { status: 400 },
      );
    }

    // Determine OTP identifier based on method
    const otpIdentifier = isWhatsAppMethod 
      ? formatPhoneNumber(user.phone!) 
      : email.toLowerCase();
    const otpType = isWhatsAppMethod ? "PHONE_VERIFICATION" : "EMAIL_VERIFICATION";

    // Verify OTP code
    const isE2EBypass =
      (process.env.CI === "true" ||
        process.env.NODE_ENV === "test" ||
        process.env.VAYVA_E2E_MODE === "true") &&
      email.toLowerCase().includes("e2e") &&
      code === "123456";

    let otpRecord: Awaited<ReturnType<typeof prisma.otpCode.findFirst>> = null;
    if (!isE2EBypass) {
      otpRecord = await prisma.otpCode.findFirst({
        where: {
          identifier: otpIdentifier,
          type: otpType,
          isUsed: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      if (!otpRecord) {
        return NextResponse.json(
          apiError(ApiErrorCode.VALIDATION_ERROR, "No valid OTP found"),
          { status: 400 },
        );
      }
      if (new Date() > otpRecord.expiresAt) {
        return NextResponse.json(
          apiError(ApiErrorCode.VALIDATION_ERROR, "OTP has expired"),
          { status: 400 },
        );
      }
      if (otpRecord.code !== code) {
        return NextResponse.json(
          apiError(ApiErrorCode.VALIDATION_ERROR, "Invalid verification code"),
          { status: 400 },
        );
      }
    }

    // Update verification status based on method
    const updateData: Record<string, boolean> = {};
    if (isWhatsAppMethod) {
      updateData.isPhoneVerified = true;
    } else {
      updateData.isEmailVerified = true;
    }

    if (!user.isEmailVerified && !isWhatsAppMethod) {
      const updates: Array<
        | ReturnType<typeof prisma.user.update>
        | ReturnType<typeof prisma.otpCode.update>
      > = [
        prisma.user.update({
          where: { id: user.id },
          data: updateData,
        }),
      ];
      if (otpRecord) {
        updates.push(
          prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
          }),
        );
      }
      await prisma.$transaction(updates);
    } else if (isWhatsAppMethod && !user.isPhoneVerified) {
      const updates: Array<
        | ReturnType<typeof prisma.user.update>
        | ReturnType<typeof prisma.otpCode.update>
      > = [
        prisma.user.update({
          where: { id: user.id },
          data: updateData,
        }),
      ];
      if (otpRecord) {
        updates.push(
          prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
          }),
        );
      }
      await prisma.$transaction(updates);
    } else if (otpRecord) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
    }

    // Get user's store for session (deterministic)
    // NOTE: If a user has multiple memberships, we must pick one consistently.
    // - Prefer the dev-seeded store for the dev test user
    // - Otherwise prefer an onboarding-complete store
    // - Otherwise fall back to newest membership
    const membership =
      user.memberships.find((m) => m.store?.onboardingCompleted === true) ||
      user.memberships[0];
    if (!membership) {
      return NextResponse.json(
        apiError(
          ApiErrorCode.INTERNAL_SERVER_ERROR,
          "No store membership found",
        ),
        { status: 500 },
      );
    }
    // Create session
    const sessionUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      storeId: membership.storeId,
      storeName: membership.store.name,
      role: membership.role_enum || membership.role?.name || "viewer",
      emailVerified: true,
      onboardingCompleted: membership.store.onboardingCompleted || false,
      plan: membership.store.plan,
      industrySlug: membership.store.industrySlug || undefined,
    };
    // Include sessionVersion so JWT tokens can be revoked server-side.
    // This is required for Bearer-token auth (mobile clients).
    (sessionUser as { sessionVersion?: number }).sessionVersion = user.sessionVersion;
    const token = await createSession(
      sessionUser,
      null,
      request.headers.get("x-forwarded-for") || null,
    );
    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || undefined,
          emailVerified: true,
          phoneVerified: user.isPhoneVerified ?? false,
          role: membership.role_enum || "OWNER",
          storeId: membership.storeId,
          createdAt:
            user.createdAt?.toISOString?.() || new Date().toISOString(),
        },
        merchant: {
          merchantId: user.id,
          storeId: membership.storeId,
          businessType: BusinessType.RETAIL,
          onboardingStatus: membership.store.onboardingStatus,
          onboardingLastStep: membership.store.onboardingLastStep || null,
          onboardingUpdatedAt:
            membership.store.onboardingUpdatedAt?.toISOString?.() ||
            new Date().toISOString(),
          plan: membership.store.plan,
          industrySlug: membership.store.industrySlug || "general",
          onboardingCompleted: membership.store.onboardingCompleted || false,
          storeName: membership.store.name,
        },
      },
    });
  } catch (error: unknown) {
    logger.error("[MERCHANT_VERIFY_OTP_POST]", error);
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Verification failed"),
      { status: 500 },
    );
  }
}
