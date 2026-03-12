import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export const GET = withVayvaAPI(
  PERMISSIONS.SECURITY_VIEW,
  async (req, { storeId, user }) => {
    try {
      // Fetch recent login logs for this user/store
      const loginLogs = await prisma.auditLog.findMany({
        where: {
          targetStoreId: storeId,
          actorUserId: user.id,
          action: { contains: "LOGIN" },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      });
      // Fetch 2FA status
      const securitySetting = await prisma.securitySetting.findUnique({
        where: { storeId },
      });
      const activeSessions = loginLogs.map((log) => {
        const meta = getObject(log.metadata);
        return {
          id: log.id,
          device:
            (typeof meta.userAgent === "string" ? meta.userAgent : null) ||
            "Unknown Device",
          location:
            (typeof meta.ipAddress === "string" ? meta.ipAddress : null) ||
            "Unknown Location",
          lastActive: log.createdAt,
          isCurrent: false,
        };
      });
      return NextResponse.json(
        {
          mfaEnabled: securitySetting?.twoFactorRequired || false,
          sessions:
            activeSessions.length > 0
              ? activeSessions
              : [
                  {
                    id: "current",
                    device: "Current Browser",
                    location: "Local",
                    lastActive: new Date(),
                    isCurrent: true,
                  },
                ],
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[SECURITY_GET]", error, { storeId, userId: user.id });
      return NextResponse.json(
        { error: "Failed to fetch security settings" },
        { status: 500 },
      );
    }
  },
);
