import { NextRequest, NextResponse } from "next/server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom, RateLimitError } from "@/lib/ratelimit";
import { createSession } from "@/lib/session.server";
import { prisma } from "@vayva/db";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// Business type enum
enum BusinessType {
  RETAIL = "RETAIL",
  WHOLESALE = "WHOLESALE",
  MANUFACTURING = "MANUFACTURING",
  SERVICES = "SERVICES",
  HOSPITALITY = "HOSPITALITY",
  TECH = "TECH",
  OTHER = "OTHER",
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

    // 1) Local OTP verification path (used by marketing guest checkout)
    // OTPs are stored under identifier: verify_email:<email> and type: EMAIL_VERIFY
    try {
      const normalizedEmail = email.toLowerCase();
      const otpRecord = await prisma.otpCode.findFirst({
        where: {
          identifier: `verify_email:${normalizedEmail}`,
          type: "EMAIL_VERIFY",
          code,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (otpRecord) {
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isPhoneVerified: true,
            createdAt: true,
            memberships: {
              select: {
                role_enum: true,
                status: true,
                store: {
                  select: {
                    id: true,
                    name: true,
                    onboardingStatus: true,
                    onboardingLastStep: true,
                    onboardingUpdatedAt: true,
                    onboardingCompleted: true,
                    plan: true,
                    industrySlug: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        });

        if (!user || user.memberships.length === 0) {
          return NextResponse.json(
            apiError(ApiErrorCode.UNAUTHENTICATED, "Invalid or expired code"),
            { status: 400 },
          );
        }

        const membership = user.memberships[0];
        const store = membership.store;

        await prisma.$transaction(async (tx) => {
          await tx.otpCode.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
          });
          await tx.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true },
          });
        });

        const token = await createSession(
          {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            storeId: store.id,
            storeName: store.name,
            role: String(membership.role_enum || "OWNER"),
            emailVerified: true,
            onboardingCompleted: store.onboardingCompleted || false,
            plan: String(store.plan || "STARTER"),
            industrySlug: store.industrySlug || undefined,
          },
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
              role: String(membership.role_enum || "OWNER"),
              storeId: store.id,
              createdAt: user.createdAt.toISOString(),
            },
            merchant: {
              merchantId: user.id,
              storeId: store.id,
              businessType: BusinessType.RETAIL,
              onboardingStatus: store.onboardingStatus,
              onboardingLastStep: store.onboardingLastStep || null,
              onboardingUpdatedAt: store.onboardingUpdatedAt.toISOString(),
              plan: String(store.plan || "STARTER"),
              industrySlug: store.industrySlug || "general",
              onboardingCompleted: store.onboardingCompleted || false,
              storeName: store.name,
            },
          },
        });
      }
    } catch (e) {
      // If local verification fails unexpectedly, fall back to backend verification path.
    }

    // Forward to Backend API to verify OTP
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase(),
        code,
        isE2EBypass: (process.env.CI === "true" ||
          process.env.NODE_ENV === "test" ||
          process.env.VAYVA_E2E_MODE === "true") &&
          email.toLowerCase().includes("e2e") &&
          code === "123456",
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: "Verification failed" }));
      return NextResponse.json(
        apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, errorData.error || "Verification failed"),
        { status: backendResponse.status },
      );
    }

    const result = await backendResponse.json();

    // Create session
    const token = await createSession(
      {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        storeId: result.membership.storeId,
        storeName: result.membership.storeName,
        role: result.membership.role,
        emailVerified: true,
        onboardingCompleted: result.membership.onboardingCompleted || false,
        plan: result.membership.plan,
        industrySlug: result.membership.industrySlug || undefined,
      },
      null,
      request.headers.get("x-forwarded-for") || null,
    );

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || "",
          lastName: result.user.lastName || "",
          phone: result.user.phone || undefined,
          emailVerified: true,
          phoneVerified: result.user.isPhoneVerified ?? false,
          role: result.membership.role || "OWNER",
          storeId: result.membership.storeId,
          createdAt: result.user.createdAt || new Date().toISOString(),
        },
        merchant: {
          merchantId: result.user.id,
          storeId: result.membership.storeId,
          businessType: BusinessType.RETAIL,
          onboardingStatus: result.membership.onboardingStatus,
          onboardingLastStep: result.membership.onboardingLastStep || null,
          onboardingUpdatedAt: result.membership.onboardingUpdatedAt || new Date().toISOString(),
          plan: result.membership.plan,
          industrySlug: result.membership.industrySlug || "general",
          onboardingCompleted: result.membership.onboardingCompleted || false,
          storeName: result.membership.storeName,
        },
      },
    });
  } catch (error: unknown) {
    logger.error("[MERCHANT_VERIFY_OTP_POST] Verification failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Verification failed"),
      { status: 500 },
    );
  }
}
