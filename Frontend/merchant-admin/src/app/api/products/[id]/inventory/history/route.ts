import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId, params: rawParams }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const params = await Promise.resolve(rawParams);
        const { id: productId } = params;
        
        // Fetch movements linked to variants of this product
        const variants = await prisma.productVariant?.findMany({
            where: { productId, product: { storeId } },
            select: { id: true, title: true }
        });
        const variantIds = variants.map((v) => v.id);

        const movements = await prisma.inventoryMovement?.findMany({
            where: {
                storeId,
                variantId: { in: variantIds }
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                inventoryLocation: true,
            }
        });

        // Enhance with variant names
        const enriched = movements.map((m) => ({
            ...m,
            variantName: variants.find((v) => v.id === m.variantId)?.title || "Unknown Variant"
        }));

        return NextResponse.json(enriched, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        const params = await Promise.resolve(rawParams);
        logger.error("[INVENTORY_HISTORY_GET] Failed to fetch inventory history", { storeId, productId: params.id, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
