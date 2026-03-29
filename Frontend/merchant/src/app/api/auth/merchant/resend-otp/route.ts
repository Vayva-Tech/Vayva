import { NextRequest, NextResponse } from "next/server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { checkRateLimitCustom, RateLimitError } from "@/lib/ratelimit";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

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
    // Rate Limit: Prevent OTP spamming (max 3 per minute)
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    try {
      await checkRateLimitCustom(ip, "resend_otp", 3, 60);
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
    if (!email) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "Email is required"),
        { status: 400 },
      );
    }
    const normalizedEmail = email.toLowerCase();

    // Call backend API to resend OTP
    const result = await apiJson<{
      success: boolean;
      message?: string;
      error?: string;
    }>(`${backendBase()}/api/auth/merchant/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    if (result.error || !result.success) {
      return NextResponse.json(
        apiError(
          ApiErrorCode.UNAUTHENTICATED,
          result.error || "Failed to resend OTP",
        ),
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/auth/merchant/resend-otp",
      operation: "RESEND_OTP",
      storeId: undefined,
    });
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Failed to resend OTP"),
      { status: 500 },
    );
  }
}
