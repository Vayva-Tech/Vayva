import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        // 24h window
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        // Fetch aggregates
        const [totalEvents, failedEvents, recentLogs] = await Promise.all([
            prisma.notificationLog?.count({
                where: {
                    storeId,
                    createdAt: { gte: oneDayAgo },
                    channel: "WHATSAPP",
                },
            }),
            prisma.notificationLog?.count({
                where: {
                    storeId,
                    createdAt: { gte: oneDayAgo },
                    status: "FAILED",
                    channel: "WHATSAPP",
                },
            }),
            prisma.notificationLog?.findMany({
                where: {
                    storeId,
                    channel: "WHATSAPP",
                },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    type: true,
                    status: true,
                    createdAt: true,
                }
            }),
        ]);
        const successCount = totalEvents - failedEvents;
        const successRate = totalEvents > 0
            ? ((successCount / totalEvents) * 100).toFixed(1) + "%"
            : "100%";
        return NextResponse.json({
            status: failedEvents === 0 ? "HEALTHY" : "DEGRADED", // Simple heuristic
            lastReceived: recentLogs[0]?.createdAt || null,
            successRate,
            events24h: totalEvents,
            failed: failedEvents,
            recentEvents: recentLogs.map((log: any) => ({
                event: log.type,
                status: log.status,
                timestamp: log.createdAt
            }))
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error: unknown) {
        logger.error("[WHATSAPP_STATS_GET] Failed to fetch WhatsApp stats", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
});
