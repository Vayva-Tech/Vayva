import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { EventBus } from "@/lib/events/eventBus";
import { logger } from "@/lib/logger";
export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, user, correlationId }: { storeId: string; user: { id: string; firstName: string | null; lastName: string | null; email: string }; correlationId: string }) => {
    try {
        const body = await req.json();
        const { actionType, entityType, entityId, payload, reason } = body;
        const approval = await prisma.approval?.create({
            data: {
                merchantId: storeId,
                requestedByUserId: user.id,
                requestedByLabel: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
                actionType,
                entityType,
                entityId,
                payload,
                reason,
                correlationId,
            },
        });
        // Audit & Notify
        await EventBus.publish({
            merchantId: storeId,
            type: "approvals.requested",
            payload: {
                approvalId: approval.id,
                actionType,
                requestedBy: approval.requestedByLabel,
            },
            ctx: {
                actorId: user.id,
                actorType: "user",
                actorLabel: approval.requestedByLabel || "Unknown User",
                correlationId,
            },
        });
        return NextResponse.json({ ok: true, id: approval.id });
    }
    catch (error) {
        logger.error("[APPROVALS_POST] Failed to create approval", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
export const GET = withVayvaAPI(PERMISSIONS.ORDERS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "20");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = { merchantId: storeId };
        if (status && status !== "all") {
            const normalized = String(status).toUpperCase();
            const allowed = ["PENDING", "APPROVED", "REJECTED"];
            if (allowed.includes(normalized)) {where.status = normalized;
            }
        }
        const items = await prisma.approval?.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
        });
        return NextResponse.json({ items }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[APPROVALS_GET] Failed to fetch approvals", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
