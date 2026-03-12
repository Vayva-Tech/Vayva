import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logAudit, AuditEventType } from "@/lib/audit";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(
  PERMISSIONS.SECURITY_MANAGE,
  async (req, { storeId, user, correlationId }) => {
    try {
      const userId = user.id;

      // 1. Delete all security sessions for this user
      // Note: Since we use JWT strategy, this won't kill active JWTs immediately unless sessionVersion is checked.
      // sessionVersion check is implemented in withVayvaAPI.
      await prisma.userSession.deleteMany({
        where: { userId },
      });

      // 2. Critical: Invalidate all active JWTs by incrementing sessionVersion
      await prisma.user.update({
        where: { id: userId },
        data: { sessionVersion: { increment: 1 } },
      });

      // 3. Log security event
      await logAudit(
        storeId,
        userId,
        AuditEventType.SECURITY_SESSION_INVALIDATED,
        {
          entityType: "USER",
          entityId: userId,
          afterState: { action: "signout_all_devices" },
          correlationId,
        },
      );

      return NextResponse.json({
        success: true,
        message: "Signed out of all devices",
      });
    } catch (error: unknown) {
      logger.error("[AUTH_SIGNOUT_ALL_POST]", error, {
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
