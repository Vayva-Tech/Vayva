import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom } from "@/lib/ratelimit";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { prisma } from "@vayva/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// Direct database authentication - used when BACKEND_API_URL is not configured
async function authenticateDirect(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
    include: {
      memberships: {
        include: {
          store: true,
        },
      },
    },
  });

  if (!user || !user.password) {
    return null;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return null;
  }

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }
  
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    jwtSecret,
    { expiresIn: "7d" }
  );

  const membership = user.memberships[0];

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    merchant: membership ? {
      id: membership.store.id,
      name: membership.store.name,
      store: {
        id: membership.store.id,
        name: membership.store.name,
      },
    } : null,
  };
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

    // Try backend API first if configured
    let result = null;
    let useDirectAuth = false;

    if (process.env.BACKEND_API_URL) {
      try {
        const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.toLowerCase(),
            password,
          }),
        });

        if (backendResponse.ok) {
          result = await backendResponse.json();
        } else {
          // Backend returned error, fall back to direct auth
          useDirectAuth = true;
        }
      } catch (backendError) {
        // Backend not available, use direct auth
        useDirectAuth = true;
      }
    } else {
      // No backend configured, use direct auth
      useDirectAuth = true;
    }

    // Use direct database authentication
    if (useDirectAuth) {
      result = await authenticateDirect(email, password);
      if (!result) {
        return NextResponse.json(
          apiError(ApiErrorCode.UNAUTHENTICATED, "Invalid email or password"),
          { status: 401 },
        );
      }
    }

    // If OTP is required, send email
    if (result?.requiresOtp) {
      const { ResendEmailService } = await import("@/lib/email/resend");
      await ResendEmailService.sendOTPEmail(
        result.email,
        result.otpCode,
        result.firstName || "Merchant",
      );

      return NextResponse.json(
        {
          ...apiError(ApiErrorCode.FORBIDDEN, "OTP_REQUIRED"),
          email: result.email,
        },
        { status: 403 },
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[LOGIN_POST] Authentication failed", { error: errMsg, email: getString(body.email) });

    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Login failed"),
      { status: 500 },
    );
  }
}
