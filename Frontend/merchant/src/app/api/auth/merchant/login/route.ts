import { logger, apiError, ApiErrorCode } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimitCustom } from "@/lib/ratelimit";
import { handleApiError } from "@/lib/api-error-handler";

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: NextRequest) {
  const body: Record<string, unknown> = {};
  try {
    const parsedBody: unknown = await request.json().catch(() => ({}));
    const requestBody = typeof parsedBody === "object" && parsedBody !== null && !Array.isArray(parsedBody) 
      ? (parsedBody as Record<string, unknown>) 
      : {} as Record<string, unknown>;

    const email = getString(requestBody.email);
    const password = getString(requestBody.password);
    const otpMethod = getString(requestBody.otpMethod);

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

    // ALWAYS use backend authentication - no fallback to direct DB access
    if (!process.env.BACKEND_API_URL) {
      logger.error("[LOGIN_POST] BACKEND_API_URL not configured - authentication impossible");
      return NextResponse.json(
        apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Backend API URL not configured"),
        { status: 503 },
      );
    }

    // Call backend directly so non-2xx (401, 403 OTP_REQUIRED) are preserved — apiJson throws on !ok.
    const backendUrl = `${process.env.BACKEND_API_URL.replace(/\/$/, "")}/api/auth/merchant/login`;
    const loginRes = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
        otpMethod: otpMethod || "EMAIL",
      }),
    });

    const result: {
      success?: boolean;
      user?: { id: string; email: string; firstName?: string };
      storeId?: string;
      token?: string;
      email?: string;
      maskedPhone?: string;
      phone?: string;
      otp?: string;
      method?: string;
      error?: { code?: string; message?: string };
    } = await loginRes.json().catch(() => ({}));

    const otpRequired =
      String(result.error?.code) === "OTP_REQUIRED" ||
      result.error?.message === "OTP_REQUIRED";

    if (loginRes.status === 403 && otpRequired) {
      return NextResponse.json(
        {
          ...apiError(ApiErrorCode.FORBIDDEN, "OTP_REQUIRED"),
          email: result.email,
          maskedPhone: result.maskedPhone,
          phone: result.phone,
          otp: result.otp,
          method: result.method,
        },
        { status: 403 },
      );
    }

    if (!loginRes.ok) {
      const msg =
        typeof result.error?.message === "string"
          ? result.error.message
          : "Authentication failed";
      const status = loginRes.status === 401 ? 401 : loginRes.status;
      return NextResponse.json(apiError(ApiErrorCode.UNAUTHORIZED, msg), {
        status: status >= 400 && status < 600 ? status : 500,
      });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/auth/merchant/login",
        operation: "MERCHANT_LOGIN",
        additionalInfo: { email: getString(body.email) },
      }
    );

    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Login failed"),
      { status: 500 },
    );
  }
}
