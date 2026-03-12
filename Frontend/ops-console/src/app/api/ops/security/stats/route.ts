import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAuth, OpsAuthContext } from "@/lib/withOpsAuth";
import { logger } from "@vayva/shared";

/**
 * GET /api/ops/security/stats
 * Get security statistics (failed logins, active sessions, etc.)
 */
export const GET = withOpsAuth(
  async (req: NextRequest, context: OpsAuthContext) => {
    const { user } = context;
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Count failed logins in last 24h
      const failedLogins = await prisma.opsAuditEvent?.count({
        where: {
          eventType: "OPS_LOGIN_FAILED",
          createdAt: {
            gte: yesterday,
          },
        },
      }) ?? 0;

      // Count active sessions
      const activeSessions = await prisma.opsSession?.count({
        where: {
          expiresAt: {
            gt: now,
          },
        },
      }) ?? 0;

      // Count admin actions in last 24h
      const adminActions = await prisma.opsAuditEvent?.count({
        where: {
          createdAt: {
            gte: yesterday,
          },
        },
      }) ?? 0;

      // Get unique active users
      const activeUsers = await prisma.opsSession?.groupBy({
        by: ["opsUserId"],
        where: {
          expiresAt: {
            gt: now,
          },
        },
      }) ?? [];

      return NextResponse.json({
        stats: {
          failedLogins,
          activeSessions,
          adminActions,
          uniqueActiveUsers: activeUsers.length,
        },
      });
    } catch (error) {
      logger.error("[SECURITY_STATS_GET]", { error });
      return NextResponse.json(
        { error: "Failed to fetch security statistics" },
        { status: 500 }
      );
    }
  },
  { requiredPermission: { category: "users", action: "view" } }
);
