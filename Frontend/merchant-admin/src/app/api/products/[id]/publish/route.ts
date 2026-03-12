import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * POST /api/products/[id]/publish
 * Publish a product to the Vayva Marketplace
 */
export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        const body = await req.json();
        const { category } = body as { category?: string };

        // Verify product ownership
        const product = await prisma.product?.findFirst({
            where: { id, storeId },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Create or update marketplace listing
        const listing = await prisma.marketplaceListing?.upsert({
            where: { productId: id },
            create: {
                productId: id,
                category: category || "general",
                status: "LISTED",
            },
            update: {
                category: category || "general",
                status: "LISTED",
            },
        });

        // Update product metadata
        const meta = (product.metadata as Record<string, unknown>) || {};
        meta.marketplaceListingId = listing?.id;
        meta.publishedToMarketplace = true;
        meta.publishedAt = new Date().toISOString();

        await prisma.product?.update({
            where: { id },
            data: { metadata: meta as unknown as import("@vayva/db").Prisma.InputJsonValue },
        });

        return NextResponse.json({ success: true, listing });
    } catch (error) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[PRODUCT_PUBLISH] Failed to publish product", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

/**
 * DELETE /api/products/[id]/publish
 * Unpublish a product from the marketplace
 */
export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

        // Verify product ownership first
        const product = await prisma.product?.findFirst({
            where: {
                id,
                storeId,
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Find and delete the listing
        const listing = await prisma.marketplaceListing?.findFirst({
            where: { productId: id },
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        await prisma.marketplaceListing?.delete({
            where: { id: listing.id },
        });

        // Update product metadata
        const meta = (product.metadata as Record<string, unknown>) || {};
        delete meta.marketplaceListingId;
        delete meta.publishedToMarketplace;
        delete meta.publishedAt;

        await prisma.product?.update({
            where: { id },
            data: { metadata: meta as unknown as import("@vayva/db").Prisma.InputJsonValue },
        });

        return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[PRODUCT_UNPUBLISH_DELETE] Failed to unpublish product", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
