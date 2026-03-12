import { NextRequest, NextResponse } from "next/server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { logger } from "@/lib/logger";

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
    const token = getString(body.token);
    const password = getString(body.password);
    if (!token || !password) {
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, "Missing required fields"),
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        apiError(
          ApiErrorCode.VALIDATION_ERROR,
          "Password must be at least 8 characters",
        ),
        { status: 400 },
      );
    }

    // Forward to Backend API to reset password
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: "Invalid or expired token" }));
      return NextResponse.json(
        apiError(ApiErrorCode.VALIDATION_ERROR, errorData.error || "Invalid or expired token"),
        { status: backendResponse.status },
      );
    }

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error: unknown) {
    logger.error("[RESET_PASSWORD] Password reset failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Internal Error"),
      { status: 500 },
    );
  }
}
