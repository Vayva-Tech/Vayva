import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const products = await prisma.product?.findMany({
      where: {
        storeId,
        ...(query && {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        handle: true,
        price: true,
        compareAtPrice: true,
        status: true,
        productImages: {
          take: 1,
          select: { url: true },
        },
        productVariants: {
          take: 1,
          select: { imageUrl: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }) || [];

    // Format to match EditorProduct interface
    const formatted = products.map((product) => {
      const thumbnail =
        product.productImages?.[0]?.url ||
        product.productVariants?.[0]?.imageUrl ||
        null;

      return {
        id: product.id,
        name: product.title,
        handle: product.handle,
        price: Number(product.price) || 0,
        thumbnail,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("[EDITOR_DATA_PRODUCTS_GET] Failed to fetch products", { storeId, error });
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
});
