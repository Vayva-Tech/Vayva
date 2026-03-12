import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { EventBus } from "@/lib/events/eventBus";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
import { logger } from "@/lib/logger";
export const POST = withVayvaAPI(PERMISSIONS.TEAM_MANAGE, async (req: NextRequest, { storeId, user, correlationId }: { storeId: string; user: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null }; correlationId: string }) => {
    let targetUserId: string | undefined;
    try {
        const body = await req.json();
        targetUserId = body.userId;

        if (!targetUserId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        // Prevent self-removal
        if (targetUserId === user.id) {
            return NextResponse.json(
                { error: "Cannot remove yourself from the store. Contact the owner if you need to leave." },
                { status: 400 }
            );
        }

        const targetMembership = await prisma.membership?.findUnique({
            where: { userId_storeId: { userId: targetUserId, storeId } },
            select: { role_enum: true },
        });
        if (!targetMembership)
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        if (targetMembership.role_enum === "OWNER") {
            return NextResponse.json({ error: "Cannot remove owner" }, { status: 400 });
        }
        await prisma.membership?.delete({
            where: { userId_storeId: { userId: targetUserId, storeId } },
        });

        // Critical: Invalidate target user's sessions by incrementing sessionVersion
        await prisma.user?.update({
            where: { id: targetUserId },
            data: { sessionVersion: { increment: 1 } },
        }).catch(() => {}); // Graceful fail if user doesn't exist anymore
        // Audit Log
        const actorLabel = `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email ||
            "System";
        await logAuditEvent(storeId, user.id, AuditEventType.TEAM_MEMBER_REMOVED, {
            targetType: "USER",
            targetId: targetUserId,
            meta: {
                correlationId,
                actorType: "merchant_user",
                actorLabel,
            },
        });
        await EventBus.publish({
            merchantId: storeId,
            type: "team.member_removed",
            payload: { targetUserId },
            ctx: {
                actorId: user.id,
                actorType: "merchant_user",
                actorLabel,
                correlationId,
            },
        });
        return NextResponse.json({ ok: true });
    }
    catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("[TEAM_REMOVE_ERROR]", { error: errorMessage, storeId, targetUserId: targetUserId || "N/A" });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
