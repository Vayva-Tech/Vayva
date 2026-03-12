import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom, RateLimitError } from "@/lib/ratelimit";
import { RevenueService } from "@/lib/ai/revenue.service";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { FlagService } from "@/services/flag";

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
    const _businessName = getString(body.businessName);
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
    // Check if user already exists via Backend API
    try {
      const checkResponse = await apiJson<{ exists: boolean }>(
        `${process.env.BACKEND_API_URL}/api/auth/check-email?email=${encodeURIComponent(email.toLowerCase())}`,
        { method: "GET" }
      );
      if (checkResponse.exists) {
        return NextResponse.json(
          apiError(ApiErrorCode.FORBIDDEN, "User already exists"),
          { status: 409 },
        );
      }
    } catch {
      // Continue to registration attempt
    }

    // Forward registration to Backend API
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: "Registration failed" }));
      return NextResponse.json(
        apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, errorData.error || "Registration failed"),
        { status: backendResponse.status },
      );
    }

    const user = await backendResponse.json();

    // Send OTP via email service
    const { ResendEmailService } = await import("@/lib/email/resend");
    await ResendEmailService.sendOTPEmail(user.email, user.otpCode, firstName);

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
          createdAt: user.createdAt || new Date().toISOString(),
        },
      },
    });
  } catch (error: unknown) {
    logger.error("[AUTH_REGISTER_POST] Registration failed", { error: error instanceof Error ? error.message : String(error), email: body?.email });
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Registration failed"),
      { status: 500 },
    );
  }
}
