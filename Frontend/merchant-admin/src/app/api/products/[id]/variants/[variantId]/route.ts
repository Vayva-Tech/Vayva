import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InventoryService } from "@/services/inventory.service";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import type { InventoryItem } from "@vayva/db";

interface VariantBody {
  price?: number | string;
  sku?: string;
  stock?: number | string;
  title?: string;
  options?: Record<string, string>;
}

export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (_req: NextRequest, { storeId, params, user }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>>; user: { id: string } }) => {
    const { id: productId, variantId } = await params;
    try {
        const deleted = await prisma.productVariant?.deleteMany({
            where: {
                id: variantId,
                productId,
                product: { storeId },
            },
        });

        if (deleted.count === 0) {
            return NextResponse.json({ error: "Variant not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    }
    catch (error) {
        logger.error("[PRODUCT_VARIANT_DELETE] Failed to delete variant", { storeId, productId, variantId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});

export const PATCH = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params, user }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>>; user: { id: string } }) => {
    const { id: productId, variantId } = await params;
    try {
        const body = await req.json().catch(() => ({})) as VariantBody;
        const { price, sku, stock, title, options } = body;

        const variant = await prisma.productVariant?.findFirst({
            where: {
                id: variantId,
                productId,
                product: { storeId },
            },
            include: { inventoryItems: true },
        });

        if (!variant) {
            return NextResponse.json({ error: "Variant not found" }, { status: 404 });
        }

        const updated = await prisma.productVariant?.updateMany({
            where: {
                id: variantId,
                productId,
                product: { storeId },
            },
            data: {
                price: price !== undefined ? parseFloat(String(price)) : undefined,
                sku,
                title,
                options: options ? JSON.stringify(options) : undefined,
            },
        });

        if (updated.count === 0) {
            return NextResponse.json({ error: "Variant not found" }, { status: 404 });
        }

        if (stock !== undefined) {
            const newStock = parseInt(String(stock));
            const currentStock = variant.inventoryItems?.reduce((acc: number, i: InventoryItem) => acc + i.onHand, 0);
            const diff = newStock - currentStock;
            if (diff !== 0) {
                await InventoryService.adjustStock(storeId, variantId, productId, diff, "Manual Update from Admin", user.id);
            }
        }

        return NextResponse.json({ success: true });
    }
    catch (error) {
        logger.error("[PRODUCT_VARIANT_UPDATE] Failed to update variant", { storeId, productId, variantId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
