import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, params, user }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>>; user: { id: string; email: string } }) => {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const prepTimeMinutes = Number(body?.prepTimeMinutes);

        if (!Number.isFinite(prepTimeMinutes) || prepTimeMinutes < 5 || prepTimeMinutes > 480) {
            return NextResponse.json({ error: "Invalid prep time" }, { status: 400 });
        }

        const order = await prisma.order?.findFirst({
            where: { id, storeId },
            select: { id: true, metadata: true },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const metadata = (order.metadata as Record<string, unknown>) || {};

        await prisma.$transaction([
            prisma.order?.update({
                where: { id },
                data: {
                    metadata: {
                        ...metadata,
                        prepTimeMinutes,
                        prepTimeUpdatedAt: new Date().toISOString(),
                    },
                },
            }),
            prisma.orderTimelineEvent?.create({
                data: {
                    orderId: id,
                    title: "Prep time updated",
                    body: `Prep time set to ${prepTimeMinutes} minutes by ${user?.email || "merchant"}.`,
                },
            }),
        ]);

        return NextResponse.json({ success: true }, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error: unknown) {
        logger.error("[ORDER_PREP_TIME_POST]", error);
        return NextResponse.json({ error: "Failed to update prep time" }, { status: 500 });
    }
});
