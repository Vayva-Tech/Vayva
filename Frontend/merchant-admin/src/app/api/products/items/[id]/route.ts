import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { sanitizeHtml } from "@/lib/input-sanitization";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (request: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = await params;
        const product = await prisma.product?.findUnique({
            where: { id, storeId },
            include: {
                productVariants: {
                    include: {
                        inventoryItems: true,
                    },
                },
            },
        });
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        const formatted = {
            id: product.id,
            name: product.title,
            description: product.description,
            status: String(product.status).toLowerCase() === "active" ? "active" : "draft",
            price: Number(product.price),
            inventory: product.productVariants?.reduce((acc: any, v: any) => acc + (v.inventoryItems[0]?.available || 0), 0),
            category: product.productType,
            images: [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variants: product.productVariants?.map((v) => ({
                id: v.id,
                name: v.title,
                price: Number(v.price),
                inventory: v.inventoryItems[0]?.available || 0,
                sku: v.sku,
            })),
            updatedAt: product.updatedAt?.toISOString(),
        };
        return NextResponse.json(formatted, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[PRODUCT_GET] Failed to fetch product", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
});
export const PUT = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (request: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = await params;
        const body = await request.json();
        // 1. Get Default Location
        let location = await prisma.inventoryLocation?.findFirst({
            where: { storeId, isDefault: true },
        });
        if (!location) {
            // Auto-create default location if missing
            location = await prisma.inventoryLocation?.create({
                data: {
                    storeId,
                    name: "Default Location",
                    isDefault: true,
                },
            });
        }
        const locationId = location.id;
        // 2. Update Product Basics
        const updated = await prisma.product?.update({
            where: { id, storeId },
            data: {
                title: body.name,
                description: sanitizeHtml(body.description),
                status: String(body.status).toUpperCase() === "ACTIVE" ? "ACTIVE" : "DRAFT",
                price: body.price,
            },
        });
        // 3. Handle Variants (Re-create strategy for MVP)
        if (body.variants) {
            await prisma.inventoryItem?.deleteMany({ where: { productId: id } });
            await prisma.productVariant?.deleteMany({ where: { productId: id } });
            for (const v of body.variants) {
                const variant = await prisma.productVariant?.create({
                    data: {
                        storeId,
                        productId: id,
                        title: v.name,
                        price: v.price,
                        sku: v.sku || "",
                        options: [], // Required by schema
                    },
                });
                // Create Inventory Item
                await prisma.inventoryItem?.create({
                    data: {
                        locationId,
                        variantId: variant.id,
                        productId: id,
                        onHand: Number(v.inventory),
                        available: Number(v.inventory),
                    },
                });
            }
        }
        return NextResponse.json(updated);
    }
    catch (error) {
        logger.error("[PRODUCT_PUT] Failed to update product", { storeId, error });
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
});
export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (request: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = await params;
        // Clean up inventory items first (FK constraint)
        await prisma.inventoryItem?.deleteMany({ where: { productId: id } });
        await prisma.productVariant?.deleteMany({ where: { productId: id } });
        await prisma.product?.delete({
            where: { id, storeId },
        });
        return NextResponse.json({ success: true });
    }
    catch (error) {
        logger.error("[PRODUCT_DELETE] Failed to delete product", { storeId, error });
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
});
