import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { id } = ctx.params;
  const { requestId } = ctx;

  try {
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        productImages: true,
        inventoryItems: {
          select: { available: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found", requestId },
        { status: 404 },
      );
    }

    // Calculate total stock from all inventory locations
    const stockLevel = product.inventoryItems.reduce(
      (sum: number, item) => sum + item.available,
      0,
    );

    const publicProduct = {
      id: product.id,
      name: product.title,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : null,
      images: product.productImages
        .sort(
          (a, b) => a.position - b.position,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        )
        .map((img: any) => img.url),
      handle: product.handle,
      options: [],
      variants: [],
      trackInventory: product.trackInventory,
      stockLevel: stockLevel,
    };

    return NextResponse.json(publicProduct, {
      headers: standardHeaders(requestId),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: unknown) {
    if (err instanceof BaseError) throw err;
    logger.error("Failed to fetch product", {
      requestId,
      productId: id,
      error: err instanceof Error ? err.message : String(err),
      app: "storefront",
    });
    return NextResponse.json(
      { error: "Failed to fetch product", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
