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
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsedBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const pin = getString(body.pin);

    if (!pin || pin.length !== 4) {
      return NextResponse.json(
        { error: "Invalid PIN format" },
        { status: 400 },
      );
    }

    const result = await apiJson<{
      success: boolean;
      verified?: boolean;
      error?: string;
    }>(`${backendBase()}/api/auth/pin/verify`, {
      method: "POST",
      headers: {
        ...auth.headers,
        "x-user-id": auth.user.id,
      },
      body: JSON.stringify({ pin }),
    });

    const { createPinSession } = await import("@/lib/auth/gating");
    await createPinSession(storeId);

    return NextResponse.json({ ...result, success: true });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/auth/pin/verify",
      operation: "VERIFY_PIN",
    });
    return NextResponse.json(
      { error: "Failed to verify PIN" },
      { status: 500 },
    );
  }
}
