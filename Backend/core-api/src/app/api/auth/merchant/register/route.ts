import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom, RateLimitError } from "@/lib/ratelimit";
import { FlagService } from "@/lib/flags/flagService";
import { RevenueService } from "@/lib/ai/revenue.service";
import { apiError, ApiErrorCode } from "@vayva/shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const parsedBody: unknown = await request.json().catch(() => ({}));
    body = isRecord(parsedBody) ? parsedBody : {};
    const email = getString(body.email);
    const password = getString(body.password);
    const firstName = getString(body.firstName);
    const lastName = getString(body.lastName);
    const businessName = getString(body.businessName);
    const selectedPlan = (getString(body.plan) as "starter" | "pro" | "pro_plus") || "starter"; // Capture plan selection
    // 0. Kill Switch & Rate Limit
    const isEnabled =
      process.env.NODE_ENV !== "production" ||
      (await FlagService.isEnabled("onboarding.enabled"));
    if (!isEnabled) {
      return NextResponse.json(
        apiError("SERVICE_UNAVAILABLE", "Registration is temporarily disabled"),
        { status: 503 },
      );
    }
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    try {
      await checkRateLimitCustom(ip, "register", 5, 3600);
    } catch (e) {
      if (e instanceof RateLimitError) {
        return NextResponse.json(
          apiError(ApiErrorCode.RATE_LIMIT_EXCEEDED, "Rate limit exceeded"),
          { status: 429 },
        );
      }
      throw e;
    }
    // 0.1 AI Anti-Abuse Check (skip in development)
    if (process.env.NODE_ENV === "production") {
      const ipHash = Buffer.from(ip).toString("base64"); // Simple hash for demo
      const deviceFingerprint =
        getString(body.deviceFingerprint) || "no-fingerprint";
      const abuseCheck = await RevenueService.checkTrialEligibility({
        ipHash,
        fingerprintHash: deviceFingerprint,
        emailDomain: email?.split("@")[1] || "unknown",
      });
      if (!abuseCheck.allowed) {
        return NextResponse.json(
          apiError(ApiErrorCode.FORBIDDEN, abuseCheck.reason || "Not eligible"),
          { status: 403 },
        );
      }
    }
    // Soft Launch Protection
    const launchMode = process.env.LAUNCH_MODE || "public";
    if (launchMode === "soft") {
      const inviteToken = body.inviteToken;
      if (!inviteToken) {
        return NextResponse.json(
          apiError(
            ApiErrorCode.FORBIDDEN,
            "Early Access Only",
            "Vayva is currently in soft launch. Please join the waitlist or provide an invitation code.",
          ),
          { status: 403 },
        );
      }
      // In a real app, verify inviteToken in DB.
    }
    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "Missing required fields"),
        { status: 400 },
      );
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "Invalid email format"),
        { status: 400 },
      );
    }
    // Password validation (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        apiError(
          ApiErrorCode.VALIDATION_ERROR,
          "Password must be at least 8 characters",
        ),
        { status: 400 },
      );
    }
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json(
        apiError(ApiErrorCode.FORBIDDEN, "User already exists"),
        { status: 409 },
      );
    }
    // Hash password
    const hashedPassword = await hash(password, 10);
    // Generate OTP (6-digit code)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10); // 10 minutes expiry
    const storeName = `${firstName}'s Store`;
    const legalName = (businessName || "").trim() || undefined;
    const fullName = `${firstName} ${lastName}`.trim();
    // Create user and store in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          isEmailVerified: false,
        },
      });
      // Create initial store for the merchant
      const store = await tx.store.create({
        data: {
          name: storeName,
          slug: `${storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
          onboardingCompleted: false,
          onboardingLastStep: "welcome",
          // Store intended plan for post-onboarding checkout redirect
          metadata: {
            intendedPlanKey: selectedPlan,
            planSelectionDate: new Date().toISOString(),
          },
        },
      });
      // Create membership (owner role)
      await tx.membership.create({
        data: {
          userId: newUser.id,
          storeId: store.id,
          role_enum: "OWNER",
          status: "ACTIVE",
        },
      });
      // Create OTP code
      await tx.otpCode.create({
        data: {
          identifier: email.toLowerCase(),
          code: otpCode,
          type: "EMAIL_VERIFICATION",
          expiresAt: otpExpiresAt,
        },
      });
      // Create initial onboarding record
      await tx.merchantOnboarding.create({
        data: {
          storeId: store.id,
          currentStepKey: "welcome",
          completedSteps: [],
          data: {
            business: {
              name: storeName,
              storeName,
              legalName,
              email: email.toLowerCase(),
            },
            identity: {
              fullName,
            },
            user: {
              firstName,
              lastName,
            },
          },
        },
      });
      // Initialize AI Subscription
      const starterPlan = await tx.aiPlan.findUnique({
        where: { name: "STARTER" },
      });
      if (starterPlan) {
        const now = new Date();
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7); // 14-day trial
        await tx.merchantAiSubscription.create({
          data: {
            storeId: store.id,
            planId: starterPlan.id,
            planKey: "STARTER",
            periodStart: now,
            periodEnd: expiry,
            trialExpiresAt: expiry,
            status: "TRIAL_ACTIVE",
          },
        });
        await tx.merchantAiProfile.create({
          data: {
            storeId: store.id,
            agentName: `${firstName}'s Assistant`,
            tonePreset: "Friendly",
          },
        });
      }
      return newUser;
    });
    // Send OTP via email
    const { ResendEmailService } = await import("@/lib/email/resend");
    await ResendEmailService.sendOTPEmail(user.email, otpCode, firstName);
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || undefined,
          emailVerified: false,
          phoneVerified: user.isPhoneVerified ?? false,
          role: "OWNER",
          createdAt:
            user.createdAt?.toISOString?.() || new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    logger.error("Registration error", error, { email: body?.email }, {});
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Registration failed"),
      { status: 500 },
    );
  }
}
