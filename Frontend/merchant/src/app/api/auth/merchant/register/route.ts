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
    const storeName = getString(body.storeName);
    const industrySlug = getString(body.industrySlug);
    const otpMethod = getString(body.otpMethod) || "EMAIL";
    
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
    if (!email || !password || !firstName || !lastName || !storeName) {
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

    // ALWAYS delegate to backend - NO direct database access
    if (!process.env.BACKEND_API_URL) {
      logger.error("[REGISTER_POST] BACKEND_API_URL not configured");
      return NextResponse.json(
        apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Backend API URL not configured"),
        { status: 503 },
      );
    }

    // Call backend registration endpoint - backend handles:
    // 1. Duplicate email check
    // 2. User creation with bcrypt password hashing
    // 3. Merchant/store creation
    // 4. OTP generation and storage
    // 5. OTP email sending via Resend
    const result = await apiJson<{
      success: boolean;
      data?: {
        userId: string;
        email: string;
        requiresVerification: boolean;
        otpMethod?: string;
      };
      error?: { code: string; message: string };
    }>(
      `${process.env.BACKEND_API_URL.replace(/\/$/, "")}/api/auth/merchant/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          firstName,
          lastName,
          storeName,
          industrySlug: industrySlug || undefined,
          otpMethod: otpMethod as "EMAIL" | "WHATSAPP",
        }),
      }
    );
    
    if (!result.success || result.error) {
      const errorCode = result.error?.code || "INTERNAL_SERVER_ERROR";
      const errorMessage = result.error?.message || "Registration failed";
      return NextResponse.json(
        apiError(errorCode as ApiErrorCode, errorMessage),
        { status: errorCode === "USER_EXISTS" ? 409 : 400 },
      );
    }

    // Return backend response as-is (no duplication of OTP email)
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error(
      "[AUTH_REGISTER_POST] Registration failed",
      { 
        error: error instanceof Error ? error.message : String(error), 
        email: body?.email 
      }
    );
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Registration failed"),
      { status: 500 },
    );
  }
}
