// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
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
    }>(`${process.env.BACKEND_API_URL}/api/auth/pin/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
        "x-store-id": storeId,
      },
      body: JSON.stringify({ pin }),
    });

    const { createPinSession } = await import("@/lib/auth/gating");
    await createPinSession(storeId);
    
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/auth/pin/verify",
      operation: "VERIFY_PIN",
    });
    return NextResponse.json(
      { error: "Failed to verify PIN" },
      { status: 500 }
    );
  }
}
