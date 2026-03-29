import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { checkRateLimitCustom } from "@/lib/ratelimit";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await checkRateLimitCustom(auth.user.id, "auth_sudo", 5, 900);

    const parsedBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const password = getString(body.password);

    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 },
      );
    }

    const correlationId =
      request.headers.get("x-correlation-id") ?? "";

    const result = await apiJson<{
      success: boolean;
      data?: { token?: string; expiresAt?: string };
      error?: string;
    }>(`${backendBase()}/api/auth/sudo`, {
      method: "POST",
      headers: {
        ...auth.headers,
        "x-user-id": auth.user.id,
        ...(correlationId ? { "x-correlation-id": correlationId } : {}),
      },
      body: JSON.stringify({ password }),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Invalid password" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      sudoExpiresAt: result.data?.expiresAt,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/auth/sudo",
      operation: "SUDO_AUTH",
    });
    return NextResponse.json(
      { error: "Failed to perform sudo authentication" },
      { status: 500 },
    );
  }
}
