import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DeletionService } from "@/services/DeletionService";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.ACCOUNT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const status = await DeletionService.getStatus(storeId);
        return NextResponse.json({ status }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        logger.error("[DELETION_STATUS_GET] Failed to get deletion status", error);
        return NextResponse.json({ error: "Failed to get deletion status" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.ACCOUNT_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string; role: string } }) => {
    // Extra guard: Verify Owner Role
    if (user.role !== "OWNER") {
        return NextResponse.json({ error: "Forbidden - Only Owner can request deletion" }, {
            status: 403,
        });
    }
    try {
        const body = await req.json().catch(() => ({}));
        const { reason } = body;
        const result = await DeletionService.requestDeletion(storeId, user.id, reason);
        if (!result.success) {
            return NextResponse.json({ error: result.error, blockers: result.blockers }, { status: 400 });
        }
        return NextResponse.json({
            success: true,
            scheduledFor: result.scheduledFor,
        });
    }
    catch (error) {
        logger.error("[DELETION_REQUEST_POST] Deletion initiation failed", error);
        return NextResponse.json({ error: "Deletion initiation failed" }, { status: 500 });
    }
});

export const DELETE = withVayvaAPI(PERMISSIONS.ACCOUNT_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string; role: string } }) => {
    // Extra guard: Verify Owner Role
    if (user.role !== "OWNER") {
        return NextResponse.json({ error: "Forbidden - Only Owner can cancel deletion" }, {
            status: 403,
        });
    }
    try {
        const result = await DeletionService.cancelDeletion(storeId);
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        logger.error("[DELETION_CANCEL_DELETE] Failed to cancel deletion", error);
        return NextResponse.json({ error: "Failed to cancel deletion" }, { status: 500 });
    }
});
