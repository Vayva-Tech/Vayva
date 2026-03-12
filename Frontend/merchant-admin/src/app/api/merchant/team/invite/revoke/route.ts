import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";
export const POST = withVayvaAPI(PERMISSIONS.TEAM_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json();
        const { inviteId } = body;

        if (!inviteId) {
            return NextResponse.json({ error: "Invite ID is required" }, { status: 400 });
        }

        const deleted = await prisma.staffInvite?.deleteMany({
            where: {
                id: inviteId,
                storeId,
                acceptedAt: null,
            },
        });

        if (deleted.count === 0) {
            return NextResponse.json(
                { error: "Invite not found or already accepted" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Invite revoked successfully",
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[API_ERROR] Revoke invite error:", { storeId, error });
        return NextResponse.json(
            { error: "Failed to revoke invite" },
            { status: 500 }
        );
    }
});
