import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

// Valid ListingStatus enum values from Prisma schema
type ListingStatus = "UNLISTED" | "PENDING_REVIEW" | "LISTED";

export async function GET(req: NextRequest) {
  const { user } = await OpsAuthService.requireSession();
  (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING_REVIEW";

    const listings = await prisma.marketplaceListing.findMany({
      where: {
        status: status as ListingStatus,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Fetch products separately since relation doesn't exist
    const productIds = [...new Set(listings.map((l) => l.productId).filter(Boolean))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        storeId: true,
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Fetch stores for products
    const storeIds = [...new Set(products.map((p) => p.storeId).filter(Boolean))];
    const stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true, slug: true },
    });
    const storeMap = new Map(stores.map((s) => [s.id, s]));

    // Transform to match frontend interface
    const transformedListings = listings.map((listing) => {
      const product = productMap.get(listing.productId);
      const store = product?.storeId ? storeMap.get(product.storeId) : null;
      return {
        id: listing.id,
        title: product?.title || "Untitled",
        description: product?.description || "",
        price: Number(product?.price || 0),
        category: listing.category || "General",
        status: listing.status,
        createdAt: listing.createdAt.toISOString(),
        product: {
          id: product?.id || listing.productId,
          title: product?.title || "Untitled",
          images: [],
        },
        store: {
          id: store?.id || "",
          name: store?.name || "Unknown",
          slug: store?.slug || "",
        },
      };
    });

    return NextResponse.json({
      listings: transformedListings,
      total: transformedListings.length,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[MARKETPLACE_LISTINGS_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 },
    );
  }
}
