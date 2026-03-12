import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.SECURITY_VIEW, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
        // Fetch recent login logs for this user/store
        const loginLogs = await prisma.auditLog?.findMany({
            where: {
                targetStoreId: storeId,
                actorUserId: user.id,
                action: { contains: "LOGIN" },
            },
            take: 5,
            orderBy: { createdAt: "desc" },
        });
        // Fetch 2FA status
        const securitySetting = await prisma.securitySetting?.findUnique({
            where: { storeId },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activeSessions = loginLogs.map((log: any) => ({
            id: log.id,
            device: log.userAgent || "Unknown Device",
            location: log.ipAddress || "Unknown Location",
            lastActive: log.createdAt,
            isCurrent: false,
        }));
        return NextResponse.json({
            mfaEnabled: securitySetting?.twoFactorRequired || false,
            sessions: activeSessions.length > 0
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
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[SECURITY_GET] Failed to fetch security settings", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch security settings" }, { status: 500 });
    }
});
