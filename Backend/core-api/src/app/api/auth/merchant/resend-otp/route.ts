import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom, RateLimitError } from "@/lib/ratelimit";
import {
  sendWhatsAppOTP,
  createOTP,
  formatPhoneNumber,
  isValidPhoneNumber,
  OTPMethod
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
    const otpMethod = (getString(body.method) || "EMAIL").toUpperCase() as OTPMethod;
    const isWhatsAppMethod = otpMethod === "WHATSAPP";

    if (!email) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "Email is required"),
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase();
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return NextResponse.json(
        apiError(ApiErrorCode.NOT_FOUND, "User not found"),
        { status: 404 },
      );
    }

    // For WhatsApp method, validate phone number
    if (isWhatsAppMethod) {
      if (!user.phone) {
        return NextResponse.json(
          apiError(
            ApiErrorCode.VALIDATION_ERROR,
            "No phone number on file. Please use email OTP.",
          ),
          { status: 400 },
        );
      }
      if (!isValidPhoneNumber(user.phone)) {
        return NextResponse.json(
          apiError(
            ApiErrorCode.VALIDATION_ERROR,
            "Invalid phone number on file. Please update your phone number or use email OTP.",
          ),
          { status: 400 },
        );
      }
    }

    // Determine identifier and type based on method
    const otpIdentifier = isWhatsAppMethod
      ? formatPhoneNumber(user.phone!)
      : normalizedEmail;
    const _otpType = isWhatsAppMethod ? "PHONE_VERIFICATION" : "EMAIL_VERIFICATION";

    // Generate new OTP using centralized function
    const otpCode = await createOTP(otpIdentifier, otpMethod);

    if (isWhatsAppMethod) {
      // Send WhatsApp OTP
      const result = await sendWhatsAppOTP(
        user.phone!,
        otpCode,
        user.firstName || "Merchant",
      );

      if (!result.success) {
        logger.error("[ResendOTP] Failed to send WhatsApp OTP", result.error, {
          email: normalizedEmail,
          phone: user.phone?.replace(/\d(?=\d{4})/g, "*"),
        });
        return NextResponse.json(
          apiError(
            "SERVICE_UNAVAILABLE" as ApiErrorCode,
            "Failed to send WhatsApp OTP. Please try email OTP instead.",
          ),
          { status: 503 },
        );
      }

      logger.info("[ResendOTP] WhatsApp OTP resent successfully", {
        email: normalizedEmail,
        phone: user.phone?.replace(/\d(?=\d{4})/g, "*"),
      });

      return NextResponse.json({
        success: true,
        data: {
          success: true,
          method: "WHATSAPP",
          phone: formatPhoneNumber(user.phone!),
        },
      });
    }

    // Send Email OTP (default method)
    try {
      const { ResendEmailService } = await import("@/lib/email/resend");
      await ResendEmailService.sendOTPEmail(
        user.email,
        otpCode,
        user.firstName || "Merchant",
      );
    } catch (error) {
      logger.error("[ResendOTP] Failed to send email OTP", error, {
        email: normalizedEmail,
      });
      return NextResponse.json(
        apiError(
          "SERVICE_UNAVAILABLE" as ApiErrorCode,
          "Failed to send email OTP. Please try again later.",
        ),
        { status: 503 },
      );
    }

    logger.info("[ResendOTP] Email OTP resent successfully", {
      email: normalizedEmail,
    });

    return NextResponse.json({
      success: true,
      data: {
        success: true,
        method: "EMAIL",
      },
    });
  } catch (error) {
    logger.error("[AUTH_RESEND_OTP]", error);
    return NextResponse.json(
      apiError(
        ApiErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to resend verification code",
      ),
      { status: 500 },
    );
  }
}
