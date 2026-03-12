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
      if (!pin || pin.length !== 4) {
        return NextResponse.json(
          { error: "Invalid PIN format" },
          { status: 400 },
        );
      }
      // Forward to Backend API to verify PIN
      const backendResponse = await fetch(`${process?.env?.BACKEND_API_URL}/api/auth/pin/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-store-id": storeId,
        },
        body: JSON.stringify({ pin }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({ error: "PIN verification failed" }));
        return NextResponse.json(
          { error: errorData.error || "PIN verification failed" },
          { status: backendResponse.status },
        );
      }

      const result = await backendResponse.json();
      
      // 4. Establish secure PIN session
      const { createPinSession } = await import("@/lib/auth/gating");
      await createPinSession(storeId);
      
      return NextResponse.json({ success: true, ...result });
    } catch (e: unknown) {
      logger.error("[AUTH_PIN_VERIFY_POST] PIN verification failed", { error: e instanceof Error ? e.message : String(e), storeId, userId: user.id });
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  },
);
