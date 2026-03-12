import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(
  PERMISSIONS.SECURITY_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: { storeId: string; user: { id: string }; correlationId: string }) => {
    try {
      const userId = user.id;

      // Forward to Backend API to sign out all sessions
      const backendResponse = await fetch(`${process?.env?.BACKEND_API_URL}/api/auth/security/signout-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
          "x-store-id": storeId,
        },
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({ error: "Failed to sign out all sessions" }));
        return NextResponse.json(
          { error: errorData.error || "Failed to sign out all sessions" },
          { status: backendResponse.status },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Signed out of all devices",
      });
    } catch (error: unknown) {
      logger.error("[AUTH_SIGNOUT_ALL_POST] Failed to sign out all sessions", error instanceof Error ? error : new Error(String(error)), {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to sign out all sessions" },
        { status: 500 },
      );
    }
  },
);
