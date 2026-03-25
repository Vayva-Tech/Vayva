import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
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

    const parsedBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const pin = getString(body.pin);

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN must be 4 digits" },
        { status: 400 },
      );
    }

    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${backendBase()}/api/auth/pin/setup`, {
      method: "POST",
      headers: {
        ...auth.headers,
        "x-user-id": auth.user.id,
      },
      body: JSON.stringify({ pin }),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/auth/pin/setup",
      operation: "SETUP_PIN",
    });
    return NextResponse.json(
      { error: "Failed to setup PIN" },
      { status: 500 },
    );
  }
}
