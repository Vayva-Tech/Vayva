import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { logger } from "@/lib/logger";
import { prisma } from "@vayva/db";

interface SessionRecord {
  id: string;
  createdAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  revokedAt: Date | null;
}

/**
 * GET /api/security/login-history
 * Fetch login history with device detection from database
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: { userId: string }) => {
      try {
        // Get login history from database
        const attempts = await prisma.userSession?.findMany({
          where: { userId: session.userId },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            createdAt: true,
            ipAddress: true,
            userAgent: true,
            revokedAt: true,
          },
        }) || [];

        const formatted = attempts.map((a: SessionRecord) => ({
          id: a.id,
          timestamp: a.createdAt.toISOString(),
          ip: a.ipAddress || "Unknown",
          device: parseUserAgent(a.userAgent || ""),
          location: null,
          success: !a.revokedAt,
          isNewDevice: false,
          userAgent: a.userAgent || "",
        }));

        return NextResponse.json({ attempts: formatted });
      } catch (error) {
        logger.error("[LOGIN_HISTORY_GET]", { error, userId: session.userId });
        return NextResponse.json(
          { error: "Failed to fetch login history" },
          { status: 500 }
        );
      }
    },
    { requireAuth: true }
  );
}

function parseUserAgent(ua: string): string {
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edge")) return "Edge";
  return "Unknown Browser";
}
