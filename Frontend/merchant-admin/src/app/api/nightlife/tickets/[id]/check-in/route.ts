import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, user, params }: { storeId: string; user: { id: string }; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

        // Get order item and verify it belongs to store
        const orderItem = await prisma.orderItem?.findFirst({
            where: { id },
            include: {
                order: true,
            },
        });

        if (!orderItem || orderItem.order?.storeId !== storeId) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // Update order metadata to mark as checked in
        const currentMetadata = (orderItem.order?.metadata as Record<string, unknown>) || {};
        
        await prisma.order?.update({
            where: { id: orderItem.orderId },
            data: {
                metadata: {
                    ...currentMetadata,
                    checkedIn: true,
                    checkedInAt: new Date().toISOString(),
                    checkedInBy: user.id,
                },
            },
        });

        return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[NIGHTLIFE_TICKETS_CHECK_IN_POST] Failed to check in ticket", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
