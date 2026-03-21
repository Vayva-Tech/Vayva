// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { cookies } from "next/headers";
import { checkRateLimitCustom } from "@/lib/ratelimit";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: NextRequest) {
  try {
    await checkRateLimitCustom(user.id, "auth_sudo", 5, 900);

    const parsedBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const password = getString(body.password);
    
    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 },
      );
    }

    const result = await apiJson<{
      success: boolean;
      data?: { token?: string; expiresAt?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/auth/sudo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
        "x-store-id": storeId,
        "x-correlation-id": correlationId,
      },
      body: JSON.stringify({ password }),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Invalid password" },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true, sudoExpiresAt: result.data?.expiresAt });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/auth/sudo",
      operation: "SUDO_AUTH",
    });
    return NextResponse.json(
      { error: "Failed to perform sudo authentication" },
      { status: 500 }
    );
  }
}
