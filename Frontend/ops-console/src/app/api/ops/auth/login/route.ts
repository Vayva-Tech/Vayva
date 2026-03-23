import { OpsAuthService } from "../../../../../lib/ops-auth";
import { type NextRequest, NextResponse } from "next/server";
import {
  handleAuthError,
  handleInternalError,
  createErrorResponse,
  ErrorCodes,
} from "../../../../../lib/api/errors";
import { checkRateLimit } from "../../../../../lib/api/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers?.get("x-forwarded-for") || "unknown";

  try {
    // Bootstrap owner if no users exist
    await OpsAuthService.bootstrapOwner();

    const { email, password, mfaCode } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_MISSING_FIELD,
        "Email and password are required",
        400
      );
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      ip,
      "/api/ops/auth/login",
      "AUTH_LOGIN"
    );

    if (!rateLimitResult.allowed) {
      await OpsAuthService.logEvent(null, "OPS_LOGIN_BLOCKED_RATE_LIMIT", {
        ip,
        email,
      });
      return createErrorResponse(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        "Too many attempts. Try again later.",
        429
      );
    }

    const start = Date.now();
    const user = await OpsAuthService.login(email, password, mfaCode) as {
      email: string;
      name: string;
      role: string;
      requiresMfa?: boolean;
      tempToken?: string;
    } | null;
    const duration = Date.now() - start;

    if (!user) {
      await OpsAuthService.logEvent(null, "OPS_LOGIN_FAILED", {
        ip,
        email,
        duration,
      });
      return createErrorResponse(
        ErrorCodes.AUTH_INVALID_CREDENTIALS,
        "Invalid credentials",
        401
      );
    }

    // MFA required but not provided
    if (user.requiresMfa) {
      return NextResponse.json({
        success: true,
        data: {
          requiresMfa: true,
          tempToken: user.tempToken,
          message: "MFA code required",
        },
        meta: {
          requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        },
      }, { status: 202 });
    }

    // Success event is logged inside OpsAuthService.login

    return NextResponse.json({
      success: true,
      data: {
        user: { email: user.email, name: user.name, role: user.role },
      },
      meta: {
        requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    try {
      if (error instanceof Error && error.message?.includes("Unauthorized")) {
        return handleAuthError(error, { ip });
      }
      return handleInternalError(error, { endpoint: "/api/ops/auth/login" });
    } catch {
      // Last-resort fallback: if even the error handler crashes, return plain JSON
      console.error("[LOGIN_ROUTE] Error handler crashed:", error);
      return NextResponse.json(
        {
          success: false,
          error: { code: "SYS_001", message: "An unexpected error occurred. Please try again later." },
          meta: { requestId: String(Date.now()), timestamp: new Date().toISOString() },
        },
        { status: 500 }
      );
    }
  }
}
