import { NextRequest, NextResponse } from "next/server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom, RateLimitError } from "@/lib/ratelimit";
import { prisma } from "@vayva/db";

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

    // Local resend path (used by marketing guest checkout)
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, isEmailVerified: true, firstName: true },
      });

      if (user && !user.isEmailVerified) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const identifier = `verify_email:${normalizedEmail}`;

        await prisma.otpCode.updateMany({
          where: {
            identifier,
            type: "EMAIL_VERIFY",
            isUsed: false,
          },
          data: { isUsed: true },
        });

        await prisma.otpCode.create({
          data: {
            identifier,
            code: otpCode,
            type: "EMAIL_VERIFY",
            expiresAt: otpExpiresAt,
          },
        });

        const { ResendEmailService } = await import("@/lib/email/resend");
        await ResendEmailService.sendOTPEmail(
          normalizedEmail,
          otpCode,
          user.firstName || "Merchant",
        );

        return NextResponse.json(
          { success: true, data: { success: true } },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
    } catch (_e) {
      // Fall back to backend resend flow.
    }

    // Forward to Backend API to resend OTP
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/api/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: "Failed to resend OTP" }));
      return NextResponse.json(
        apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, errorData.error || "Failed to resend OTP"),
        { status: backendResponse.status },
      );
    }

    const result = await backendResponse.json();

    // Send OTP via email
    const { ResendEmailService } = await import("@/lib/email/resend");
    await ResendEmailService.sendOTPEmail(
      normalizedEmail,
      result.otpCode,
      result.firstName || "Merchant",
    );
    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error: unknown) {
    logger.error("[AUTH_RESEND_OTP] Failed to resend OTP", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      apiError(
        ApiErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to resend verification code",
      ),
      { status: 500 },
    );
  }
}
