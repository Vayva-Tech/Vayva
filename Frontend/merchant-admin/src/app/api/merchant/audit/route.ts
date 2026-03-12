import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PLATFORM_AUDIT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
        const cursor = searchParams.get("cursor"); // expects "id"
        // Filters
        const entityType = searchParams.get("entity_type");
        const entityId = searchParams.get("entity_id");
        const action = searchParams.get("action");
        const actorId = searchParams.get("actor_id");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = { storeId };
        if (entityType)
            where.entityType = entityType;
        if (entityId)
            where.entityId = entityId;
        if (action)
            where.action = action;
        if (actorId)
            where.actorId = actorId;
        const logs = await prisma.auditLog?.findMany({
            where,
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
        let nextCursor = null;
        if (logs.length > limit) {
            const nextItem = logs.pop();
            nextCursor = nextItem?.id;
        }
        return NextResponse.json({
            items: logs,
            next_cursor: nextCursor,
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[AUDIT_LOG_GET] Failed to fetch audit logs", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
