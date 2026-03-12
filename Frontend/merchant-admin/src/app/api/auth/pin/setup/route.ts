import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.SECURITY_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const pin = getString(body.pin);
      // Basic validation
      if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
        return NextResponse.json(
          { error: "PIN must be 4 digits" },
          { status: 400 },
        );
      }
      // Forward to Backend API
      const backendResponse = await fetch(`${process?.env?.BACKEND_API_URL}/api/auth/pin/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-store-id": storeId,
        },
        body: JSON.stringify({ pin }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({ error: "Failed to setup PIN" }));
        return NextResponse.json(
          { error: errorData.error || "Failed to setup PIN" },
          { status: backendResponse.status },
        );
      }

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[AUTH_PIN_SETUP_POST] PIN setup failed", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to setup PIN" },
        { status: 500 },
      );
    }
  },
);
