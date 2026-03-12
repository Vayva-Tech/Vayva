import { NextResponse } from "next/server";
import { PublicProduct } from "@/types/storefront";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db } = ctx;

  try {
    const products = await db.product.findMany({
      // storeId is automatically injected by the isolated client extension
      include: {
        productImages: true,
      },
    });

    // Transform to PublicProduct format with explicit typing
    const publicProducts: PublicProduct[] = (
      products as Array<Record<string, any>>
    ).map((p) => ({
      id: p.id as string,
      storeId: p.storeId as string,
      name: p.title as string,
      description: (p.description as string) || "",
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
      images:
        (p.productImages as Array<Record<string, any>>)
          ?.sort((a, b) => (a.position as number) - (b.position as number))
          .map((img) => img.url as string) || [],
      variants: [],
      inStock: true,
      handle: p.handle,
      type: "physical",
    }));

    return NextResponse.json(publicProducts, {
      headers: standardHeaders(requestId),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (error instanceof BaseError) throw error;
    logger.error("Failed to fetch products", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      app: "storefront",
    });
    return NextResponse.json(
      { error: "Failed to fetch products", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
