import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/products/[id]/publish
 * Publish a product to the Vayva Marketplace
 * TEMPORARILY DISABLED - Marketplace coming soon
 */
export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async () => {
  return NextResponse.json(
    {
      error: "Marketplace Coming Soon",
      message:
        "The Vayva Marketplace is currently being enhanced. Please check back soon for the new and improved marketplace experience!",
    },
    { status: 503 },
  );
});

/**
 * DELETE /api/products/[id]/publish
 * Unpublish a product from the marketplace
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      // Verify product ownership first
      const product = await prisma.product.findFirst({
        where: {
          id,
          storeId,
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      // Find and delete the listing
      const listing = await prisma.marketplaceListing.findFirst({
        where: { productId: id },
      });

      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 },
        );
      }

      await prisma.marketplaceListing.delete({
        where: { id: listing.id },
      });

      // Update product metadata
      const meta = (product.metadata as Record<string, unknown>) || {};
      delete meta.marketplaceListingId;
      delete meta.publishedToMarketplace;
      delete meta.publishedAt;

      await prisma.product.update({
        where: { id },
        data: { metadata: meta as Prisma.InputJsonValue },
      });

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[PRODUCT_UNPUBLISH_DELETE]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
