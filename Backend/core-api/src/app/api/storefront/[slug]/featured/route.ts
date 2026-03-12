import { NextRequest, NextResponse } from "next/server";
import { Prisma, prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type ShowcaseConfig = {
  mode: string;
  autoStrategy: string;
  limit: number;
  productIds: string[];
};

type FeaturedProduct = Prisma.ProductGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    price: true;
    compareAtPrice: true;
    handle: true;
    productType: true;
    productImages: {
      take: 1;
      select: { url: true };
    };
  };
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function getStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((v): v is string => typeof v === "string");
  return items;
}

function getDefaultShowcaseConfig(): ShowcaseConfig {
  return {
    mode: "auto",
    autoStrategy: "newest",
    limit: 8,
    productIds: [],
  };
}

function getShowcaseConfig(sectionConfig: unknown): ShowcaseConfig {
  const defaults = getDefaultShowcaseConfig();
  if (!isRecord(sectionConfig)) return defaults;
  const featured = sectionConfig.featured;
  if (!isRecord(featured)) return defaults;

  return {
    mode: getString(featured.mode) ?? defaults.mode,
    autoStrategy: getString(featured.autoStrategy) ?? defaults.autoStrategy,
    limit: getNumber(featured.limit) ?? defaults.limit,
    productIds: getStringArray(featured.productIds) ?? defaults.productIds,
  };
}

/**
 * GET /api/storefront/[slug]/featured
 * Returns featured products based on the store's showcase configuration
 * Supports both auto (newest, bestselling, discounted, random) and manual modes
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Find the store
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Get the published storefront config (or draft if not published)
    let sectionConfig: unknown = {};

    const published = await prisma.storefrontPublished.findUnique({
      where: { storeId: store.id },
      select: { sectionConfig: true },
    });

    if (published?.sectionConfig) {
      sectionConfig = published.sectionConfig;
    } else {
      // Fallback to draft if not published
      const draft = await prisma.storefrontDraft.findUnique({
        where: { storeId: store.id },
        select: { sectionConfig: true },
      });
      sectionConfig = draft?.sectionConfig ?? {};
    }

    const showcaseConfig = getShowcaseConfig(sectionConfig);

    const { mode, autoStrategy, limit, productIds } = showcaseConfig;

    let products: FeaturedProduct[] = [];

    if (mode === "manual" && productIds?.length > 0) {
      // Manual mode: fetch specific products in order
      const allProducts = await prisma.product.findMany({
        where: {
          storeId: store.id,
          id: { in: productIds },
          status: "ACTIVE",
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          compareAtPrice: true,
          handle: true,
          productType: true,
          productImages: {
            orderBy: { position: "asc" },
            take: 1,
            select: { url: true },
          },
        },
      });

      // Preserve the order from productIds
      const productMap = new Map(allProducts.map((p) => [p.id, p]));
      products = productIds
        .map((id: string) => productMap.get(id))
        .filter((p): p is FeaturedProduct => typeof p !== "undefined");
    } else {
      // Auto mode: apply strategy
      let orderBy: Prisma.ProductOrderByWithRelationInput = {
        createdAt: "desc",
      }; // default: newest

      if (autoStrategy === "bestselling") {
        // For bestselling, we'd ideally join with orders, but for now use a simple approach
        // In production, you'd have a salesCount field or aggregate from OrderItem
        orderBy = { createdAt: "desc" }; // Placeholder - would need sales data
      } else if (autoStrategy === "discounted") {
        // Products with compareAtPrice > price (on sale)
        const discountedProducts = await prisma.product.findMany({
          where: {
            storeId: store.id,
            status: "ACTIVE",
            compareAtPrice: { not: null },
          },
          orderBy: { createdAt: "desc" },
          take: limit || 8,
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            compareAtPrice: true,
            handle: true,
            productType: true,
            productImages: {
              orderBy: { position: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        });
        // Filter to only those where compareAtPrice > price
        products = discountedProducts.filter(
          (p) => p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price),
        );
      } else if (autoStrategy === "random") {
        // Fetch more than needed and shuffle
        const allProducts = await prisma.product.findMany({
          where: {
            storeId: store.id,
            status: "ACTIVE",
          },
          take: Math.min((limit || 8) * 3, 50), // Fetch 3x to have variety
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            compareAtPrice: true,
            handle: true,
            productType: true,
            productImages: {
              orderBy: { position: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        });
        // Shuffle and take limit
        products = allProducts
          .sort(() => Math.random() - 0.5)
          .slice(0, limit || 8);
      }

      // Default newest strategy (or fallback)
      if (products.length === 0 && autoStrategy !== "discounted") {
        products = await prisma.product.findMany({
          where: {
            storeId: store.id,
            status: "ACTIVE",
          },
          orderBy,
          take: limit || 8,
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            compareAtPrice: true,
            handle: true,
            productType: true,
            productImages: {
              orderBy: { position: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        });
      }
    }

    // Transform to frontend format
    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.title,
      description: p.description,
      price: Number(p.price),
      originalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      image: p.productImages?.[0]?.url || "",
      handle: p.handle,
      category: p.productType,
      isOnSale: p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price),
    }));

    return NextResponse.json(
      {
        products: formattedProducts,
        config: {
          mode,
          strategy: autoStrategy,
          count: formattedProducts.length,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    logger.error("[STOREFRONT_FEATURED]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
