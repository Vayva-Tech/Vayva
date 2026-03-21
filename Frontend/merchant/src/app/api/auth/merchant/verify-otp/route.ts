// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom, RateLimitError } from "@/lib/ratelimit";
import { createSession } from "@/lib/session.server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export const dynamic = "force-dynamic";

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
    // Validation
    if (!email || !code) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "Email and OTP are required"),
        { status: 400 },
      );
    }

    // Call backend API to verify OTP
    const result = await apiJson<{
      success: boolean;
      user?: { id: string; email: string; firstName?: string };
      storeId?: string;
      token?: string;
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/auth/merchant/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      }
    );
    
    if (result.error || !result.success) {
      return NextResponse.json(
        apiError(ApiErrorCode.INVALID_CREDENTIALS, result.error || "Invalid OTP"),
        { status: 401 },
      );
    }

    // Create session if user and storeId provided
    if (result.user && result.storeId) {
      await createSession(result.user, result.storeId, request);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/auth/merchant/verify-otp",
        operation: "VERIFY_OTP",
        storeId: undefined,
      }
    );
    throw error;
  }
}
