import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { EventBus } from "@/lib/events/eventBus";
import { logger } from "@/lib/logger";
export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, user, params }: { storeId: string; user: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null }; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = await params;
        const request = await prisma.approval?.findUnique({ where: { id } });
        if (!request)
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        if (request.merchantId !== storeId)
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if ((request as any).status !== "PENDING")
            return NextResponse.json({ error: "Request not pending" }, { status: 400 });
        const body = await req.json().catch(() => ({}));
        const reason = body?.decisionReason;
        await prisma.approval?.update({
            where: { id },
            data: {
                status: "REJECTED",
                decidedByUserId: user.id,
                decidedByLabel: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown",
                decidedAt: new Date(),
                decisionReason: reason,
            },
        });
        await EventBus.publish({
            merchantId: storeId,
            type: "approvals.rejected",
            payload: { approvalId: id, reason },
            ctx: {
                actorId: user.id,
                actorType: "user",
                actorLabel: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown",
                correlationId: request.correlationId || `req_${id}`,
            },
        });
        return NextResponse.json({ ok: true, status: "rejected" });
    }
    catch (error) {
        logger.error("[APPROVAL_REJECT] Failed to reject approval", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
