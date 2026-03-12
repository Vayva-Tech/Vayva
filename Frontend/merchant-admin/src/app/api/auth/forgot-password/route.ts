import { NextRequest, NextResponse } from "next/server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom, RateLimitError } from "@/lib/security/rate-limit";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const parsedBody: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const email = getString(body.email);

    if (!email) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "Email is required"),
        { status: 400 }
      );
    }

    // Rate limit check using Redis-based rate limiter
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const emailLower = email.toLowerCase();

    try {
      await checkRateLimitCustom(ip, "forgot_password", 5, 3600); // 5 per hour per IP
      await checkRateLimitCustom(emailLower, "forgot_password_email", 5, 3600); // 5 per hour per email
    } catch (e) {
      if (e instanceof RateLimitError) {
        // Still return 200 to prevent enumeration
        return NextResponse.json({ success: true, data: { success: true } });
      }
      throw e;
    }

    // Forward to Backend API
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailLower }),
    });

    // Always return success to prevent user enumeration
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    logger.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Internal Error"),
      { status: 500 }
    );
  }
}
