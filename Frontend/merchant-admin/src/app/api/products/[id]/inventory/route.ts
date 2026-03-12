import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
        const variants = await prisma.productVariant?.findMany({
            where: {
                productId: id,
                product: { storeId },
            },
            include: {
                inventoryItems: {
                    select: {
                        available: true,
                    },
                },
            },
        });

        const inventory = variants.map((v) => ({
            id: v.id,
            title: v.title,
            sku: v.sku,
            inventory: v.inventoryItems[0]?.available || 0,
        }));

        return NextResponse.json({ inventory }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[PRODUCT_INVENTORY_GET] Failed to fetch inventory", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
