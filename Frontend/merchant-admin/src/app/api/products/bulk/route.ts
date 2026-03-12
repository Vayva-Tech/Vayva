import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logActivity } from "@/lib/activity-logger";
import { logger } from "@/lib/logger";

export const PATCH = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
        const body = await req.json().catch(() => ({}));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { items }: { items: { id: string, data: any }[] } = body;
        
        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "No items to update" }, { status: 400 });
        }

        // 1. Fetch current state for logging and ownership verification
        const ids = items.map((i) => i.id);
        const currentProducts = await prisma.product?.findMany({
            where: { id: { in: ids }, storeId }
        });
        
        const productMap = new Map(currentProducts.map((p) => [p.id, p]));
        
        // Filter items to only those that user owns
        const validItems = items.filter((item) => productMap.has(item.id));

        if (validItems.length === 0) {
            return NextResponse.json({ error: "No valid products found for update" }, { status: 404 });
        }

        // Use transaction for atomic updates
        const updates = await prisma.$transaction(validItems.map((item) => {
            return prisma.product?.update({
                where: { id: item.id },
                data: {
                    title: item.data?.name || item.data?.title || undefined,
                    price: item.data?.price !== undefined ? Number(item.data?.price) : undefined,
                    status: (item.data?.status as any) || undefined,
                },
            });
        }));

        // 2. Async Logging
        validItems.forEach((item) => {
            const older = productMap.get(item.id);
            const newer = updates.find((u) => u && u.id === item.id);
            if (older && newer) {
                logActivity({
                    storeId,
                    actorUserId: user.id,
                    action: "PRODUCT_BULK_UPDATE",
                    targetType: "PRODUCT",
                    targetId: item.id,
                    before: { title: older.title, price: Number(older.price), status: (older as { status?: string }).status },
                    after: { title: newer.title, price: Number(newer.price), status: (newer as { status?: string }).status }
                });
            }
        });

        return NextResponse.json({
            success: true,
            updatedCount: updates.length,
            message: `Successfully updated ${updates.length} products`
        });
    }
    catch (error) {
        logger.error("[PRODUCTS_BULK_PATCH] Failed to bulk update products", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
