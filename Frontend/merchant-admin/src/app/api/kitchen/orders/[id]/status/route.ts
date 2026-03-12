import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const PATCH = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        const body = await req.json().catch(() => ({}));
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Status required" }, { status: 400 });
        }

        const order = await prisma.order?.update({
            where: { id, storeId },
            data: {
                fulfillmentStatus: status
            }
        });

        return NextResponse.json({ success: true, order });
    }
    catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[KITCHEN_ORDER_STATUS_PATCH] Failed to update order status", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
