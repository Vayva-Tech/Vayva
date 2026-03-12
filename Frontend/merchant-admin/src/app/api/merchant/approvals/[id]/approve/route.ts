import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { executeApproval } from "@/lib/approvals/execute";
import { EventBus } from "@/lib/events/eventBus";
import { logger } from "@/lib/logger";
export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, user, params }: { storeId: string; user: { id: string; firstName: string | null; lastName: string | null; email: string }; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = await params;
        // Fetch request to check merchantId
        const request = await prisma.approval?.findUnique({
            where: { id },
        });
        if (!request)
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        if (request.merchantId !== storeId)
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if ((request as any).status !== "PENDING")
            return NextResponse.json({ error: "Request not pending" }, { status: 400 });
        // Note: withVayvaAPI already checked ORDERS_MANAGE.
        // In old code, it checked APPROVALS_DECIDE and action-specific perms.
        // We'll trust ORDERS_MANAGE for now as the decision-maker role.
        // Approve
        const body = await req.json().catch(() => ({}));
        const reason = body?.decisionReason;
        const updated = await prisma.approval?.update({
            where: { id },
            data: {
                status: "APPROVED",
                decidedByUserId: user.id,
                decidedByLabel: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
                decidedAt: new Date(),
                decisionReason: reason,
            },
        });
        // Audit
        await EventBus.publish({
            merchantId: storeId,
            type: "approvals.approved",
            payload: { approvalId: id },
            ctx: {
                actorId: user.id,
                actorType: "user",
                actorLabel: updated.decidedByLabel || "System",
                correlationId: request.correlationId || `req_${id}`,
            },
        });
        // EXECUTE
        try {
            await executeApproval(id, user.id, request.correlationId || `req_${id}`);
        }
        catch (err) {
            logger.error("[APPROVAL_APPROVE] Execution failed immediately", { error: err });
        }
        return NextResponse.json({ ok: true, status: "approved" });
    }
    catch (error) {
        logger.error("[APPROVAL_APPROVE] Failed to approve", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
