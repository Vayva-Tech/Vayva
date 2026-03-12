import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { cookies } from "next/headers";
import { checkRateLimitCustom } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.SECURITY_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: { storeId: string; user: { id: string }; correlationId: string }) => {
    try {
      await checkRateLimitCustom(user.id, "auth_sudo", 5, 900);

      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const password = getString(body.password);
      if (!password) {
        return NextResponse.json(
          { error: "Password required" },
          { status: 400 },
        );
      }

      // Forward to Backend API to verify sudo password
      const backendResponse = await fetch(`${process?.env?.BACKEND_API_URL}/api/auth/sudo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-store-id": storeId,
          "x-correlation-id": correlationId,
        },
        body: JSON.stringify({ password }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({ error: "Invalid password" }));
        return NextResponse.json(
          { error: errorData.error || "Invalid password" },
          { status: backendResponse.status },
        );
      }

      const result = await backendResponse.json();

      // Get session token from cookie store
      const cookieStore = await cookies();
      const token =
        cookieStore.get("next-auth.session-token")?.value ||
        cookieStore.get("__Secure-next-auth.session-token")?.value;

      if (!token) {
        return NextResponse.json({ error: "Session missing" }, { status: 401 });
      }

      return NextResponse.json({ success: true, sudoExpiresAt: result.sudoExpiresAt });
    } catch (error: unknown) {
      logger.error("[AUTH_SUDO_POST] Failed to verify", { error: error instanceof Error ? error.message : String(error), storeId, userId: user.id });
      return NextResponse.json({ error: "Failed to verify" }, { status: 500 });
    }
  },
);
