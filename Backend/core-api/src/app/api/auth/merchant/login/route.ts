import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom } from "@/lib/ratelimit";
import { FEATURES } from "@/lib/env-validation";
import { apiError, ApiErrorCode } from "@vayva/shared";
import {
  sendWhatsAppOTP,
  createOTP,
  formatPhoneNumber,
  isValidPhoneNumber,
  maskPhoneNumber,
  OTPMethod,
} from "@/lib/whatsapp-otp";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getStoredPassword(user: unknown): string | undefined {
  if (!isRecord(user)) return undefined;
  const password = user.password;
  if (typeof password === "string") return password;
  const passwordHash = user.passwordHash;
  if (typeof passwordHash === "string") return passwordHash;
  const hashedPassword = user.hashedPassword;
  if (typeof hashedPassword === "string") return hashedPassword;
  return undefined;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const parsedBody: unknown = await request.json().catch(() => ({}));
    body = isRecord(parsedBody) ? parsedBody : {};

    const email = getString(body.email);
    const password = getString(body.password);

    const host = request.headers.get("host") || "";
    const _isLocalhostRequest = /(^|\b)(localhost|127\.0\.0\.1)(\b|:)/i.test(
      host,
    );

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        apiError("SERVICE_UNAVAILABLE", "Database not configured"),
        { status: 503 },
      );
    }
    // Rate Limit: 10 per hour per IP (disabled in development)
    if (process.env.NODE_ENV !== "development") {
      const ip = request.headers.get("x-forwarded-for") || email || "unknown";
      await checkRateLimitCustom(ip, "login", 10, 3600);
    }
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        apiError(
          ApiErrorCode.VALIDATION_ERROR,
          "Email and password are required",
        ),
        { status: 400 },
      );
    }
    // Find user with memberships
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: {
            store: true,
            role: true,
          },
        },
      },
    });
    if (!user) {
      logger.warn("Login attempt with non-existent email", undefined, {
        email,
      });
      return NextResponse.json(
        apiError(ApiErrorCode.UNAUTHENTICATED, "Invalid email or password"),
        { status: 401 },
      );
    }
    // Verify password
    const storedPassword = getStoredPassword(user);
    if (!storedPassword || typeof storedPassword !== "string") {
      logger.warn("Login attempt with missing password hash", undefined, {
        email,
      });
      return NextResponse.json(
        apiError(ApiErrorCode.UNAUTHENTICATED, "Invalid email or password"),
        { status: 401 },
      );
    }

    const isValidPassword = await compare(password, storedPassword);
    if (!isValidPassword) {
      logger.warn("Login attempt with invalid password", undefined, { email });
      return NextResponse.json(
        apiError(ApiErrorCode.UNAUTHENTICATED, "Invalid email or password"),
        { status: 401 },
      );
    }

    // Get OTP method preference (email or whatsapp)
    const otpMethod = (getString(body.otpMethod) || "EMAIL").toUpperCase() as OTPMethod;
    const isWhatsAppMethod = otpMethod === "WHATSAPP";

    // Validate phone number for WhatsApp OTP
    if (isWhatsAppMethod) {
      if (!user.phone) {
        return NextResponse.json(
          apiError(
            ApiErrorCode.VALIDATION_ERROR,
            "No phone number on file. Please use email OTP or add a phone number to your account.",
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

    // Always require OTP after valid credentials
    const otpIdentifier = isWhatsAppMethod ? user.phone! : user.email;
    const otpType = isWhatsAppMethod ? "PHONE_VERIFICATION" : "EMAIL_VERIFICATION";
    const otpCode = await createOTP(otpIdentifier, otpMethod);

    // In local dev, don't hard-block login if delivery isn't configured.
    // We'll still create the OTP record and return the code for testing.
    const isDevMode = process.env.NODE_ENV !== "production";
    const shouldReturnOTPInDev = isDevMode && !FEATURES.EMAIL_ENABLED;

    if (isWhatsAppMethod) {
      // Send WhatsApp OTP
      const result = await sendWhatsAppOTP(user.phone!, otpCode, user.firstName || "Merchant");
      
      if (!result.success) {
        logger.error("[Login] Failed to send WhatsApp OTP", { error: result.error, email, phone: maskPhoneNumber(user.phone!) });
        
        if (shouldReturnOTPInDev) {
          return NextResponse.json(
            {
              ...apiError(ApiErrorCode.FORBIDDEN, "OTP_REQUIRED"),
              email: user.email,
              maskedPhone: maskPhoneNumber(user.phone!),
              phone: formatPhoneNumber(user.phone!),
              otp: otpCode,
              method: "WHATSAPP",
              whatsappDelivery: "failed",
            },
            { status: 403 },
          );
        }
        
        return NextResponse.json(
          apiError(
            "SERVICE_UNAVAILABLE" as ApiErrorCode,
            "Failed to send WhatsApp OTP. Please try email OTP instead.",
          ),
          { status: 503 },
        );
      }

      logger.info("[Login] WhatsApp OTP sent successfully", {
        email,
        maskedPhone: maskPhoneNumber(user.phone!),
      });

      if (shouldReturnOTPInDev) {
        return NextResponse.json(
          {
            ...apiError(ApiErrorCode.FORBIDDEN, "OTP_REQUIRED"),
            email: user.email,
            maskedPhone: maskPhoneNumber(user.phone!),
            phone: formatPhoneNumber(user.phone!),
            otp: otpCode,
            method: "WHATSAPP",
          },
          { status: 403 },
        );
      }

      return NextResponse.json(
        {
          ...apiError(ApiErrorCode.FORBIDDEN, "OTP_REQUIRED"),
          email: user.email,
          maskedPhone: maskPhoneNumber(user.phone!),
          phone: formatPhoneNumber(user.phone!),
          method: "WHATSAPP",
        },
        { status: 403 },
      );
    }

    // Send Email OTP (default method)
    try {
      const { ResendEmailService } = await import("@/lib/email/resend");
      await ResendEmailService.sendOTPEmail(
        user.email,
        otpCode,
        user.firstName || "Merchant",
      );
    } catch (e) {
      // Dev should never hard-fail login because of email provider issues.
      if (shouldReturnOTPInDev) {
        return NextResponse.json(
          {
            ...apiError(ApiErrorCode.FORBIDDEN, "OTP_REQUIRED"),
            email: user.email,
            otp: otpCode,
            method: "EMAIL",
            emailDelivery: "failed",
          },
          { status: 403 },
        );
      }
      throw e;
    }

    if (shouldReturnOTPInDev) {
      return NextResponse.json(
        {
          ...apiError(ApiErrorCode.FORBIDDEN, "OTP_REQUIRED"),
          email: user.email,
          otp: otpCode,
          method: "EMAIL",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        ...apiError(ApiErrorCode.FORBIDDEN, "OTP_REQUIRED"),
        email: user.email,
        method: "EMAIL",
      },
      { status: 403 },
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const _errStack = error instanceof Error ? error.stack : undefined;
    logger.error("Login failed", error, { email: getString(body.email) }, {});

    const message =
      error instanceof Error && typeof errMsg === "string"
        ? errMsg
        : "Login failed";
    const looksLikeDbIssue =
      /DATABASE_URL|prisma|\brelation\b|\bdoes not exist\b|\bconnect\b/i.test(
        message,
      );

    const host = request.headers.get("host") || "";
    const isLocalhostRequest = /(^|\b)(localhost|127\.0\.0\.1)(\b|:)/i.test(
      host,
    );
    const shouldExposeDebug =
      process.env.NODE_ENV !== "production" || isLocalhostRequest;
    const userFacingMessage =
      looksLikeDbIssue && shouldExposeDebug
        ? "Database not ready for login. Run database migrations (pnpm --filter @vayva/db db:push) and restart the dev server."
        : looksLikeDbIssue
          ? "Database not ready for login"
          : "Login failed";

    return NextResponse.json(
      apiError(
        looksLikeDbIssue
          ? "SERVICE_UNAVAILABLE"
          : ApiErrorCode.INTERNAL_SERVER_ERROR,
        userFacingMessage,
        shouldExposeDebug ? message : undefined,
      ),
      { status: looksLikeDbIssue ? 503 : 500 },
    );
  }
}
