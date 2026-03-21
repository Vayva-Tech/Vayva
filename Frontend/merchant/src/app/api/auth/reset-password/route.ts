import { NextRequest, NextResponse } from "next/server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

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

    // Call backend API to reset password
    const result = await apiJson<{
      success: boolean;
      data?: { success: boolean };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/auth/reset-password",
        operation: "RESET_PASSWORD",
      }
    );
    throw error;
  }
}
