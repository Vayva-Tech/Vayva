// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { checkRateLimitCustom } from "@/lib/ratelimit";
import { apiError, ApiErrorCode } from "@vayva/shared";
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
        apiError(ApiErrorCode.SERVICE_UNAVAILABLE, "Backend API URL not configured"),
        { status: 503 },
      );
    }

    // Call backend authentication endpoint
    const result = await apiJson<{
      success: boolean;
      user?: { id: string; email: string; firstName?: string };
      storeId?: string;
      token?: string;
      email?: string;
      maskedPhone?: string;
      phone?: string;
      otp?: string;
      method?: string;
      error?: { code?: ApiErrorCode; message?: string };
    }>(`${process.env.BACKEND_API_URL}/api/auth/merchant/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
        otpMethod: otpMethod || "EMAIL",
      }),
    });

    // If OTP is required, the backend returns specific error with email
    if (result.error?.code === "OTP_REQUIRED" || result.error?.message === "OTP_REQUIRED") {
      return NextResponse.json(
        {
          ...apiError(ApiErrorCode.FORBIDDEN, "OTP_REQUIRED"),
          email: result.email,
          maskedPhone: result.maskedPhone,
          phone: result.phone,
          otp: result.otp, // Only in dev mode
          method: result.method, // Only in dev mode
        },
        { status: 403 },
      );
    }

    // Successful login (token already set by backend via cookie)
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
