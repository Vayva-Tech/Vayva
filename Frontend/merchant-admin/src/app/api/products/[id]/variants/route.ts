import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { InventoryService } from "@/services/inventory.service";
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
                inventoryItems: true,
            },
            orderBy: { position: "asc" },
        });

        return NextResponse.json({ variants }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[PRODUCT_VARIANTS_GET] Failed to fetch variants", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        const body = await req.json().catch(() => ({}));
        const { title, sku, price, barcode } = body;

        if (!title || price === undefined) {
            return NextResponse.json({ error: "Title and price required" }, { status: 400 });
        }

        // Verify product ownership
        const product = await prisma.product?.findFirst({
            where: { id, storeId },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const variant = await prisma.productVariant?.create({
            data: {
                storeId,
                productId: id,
                title,
                sku,
                price: Number(price),
                barcode,
                options: {}, // Default empty options if not provided
            },
        });

        return NextResponse.json({ success: true, variant }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[PRODUCT_VARIANTS_POST] Failed to create variant", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
