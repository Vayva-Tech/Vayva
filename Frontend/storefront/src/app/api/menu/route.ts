import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { PublicMenu, PublicWeek, PublicProduct } from "@/types/storefront";
import { getTenantFromHost } from "@/lib/tenant";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (req: any, ctx: any) => {
  const { requestId } = ctx;
  const t = await getTenantFromHost(req.headers.get("host") || undefined);
  if (!t.ok) {
    return NextResponse.json(
      { error: "Store not found", requestId },
      { status: 404 },
    );
  }

  try {
    const store = await prisma.store.findUnique({
      where: { slug: t.slug },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found", requestId },
        { status: 404 },
      );
    }

    const collections = await prisma.collection.findMany({
      where: { storeId: store.id },
      include: {
        collectionProducts: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                handle: true,
                tags: true,
                productImages: true,
              },
            },
          },
        },
      },
    });

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      include: {
        productImages: true,
      },
    });

    const weeks: PublicWeek[] = collections
      .filter((c) => c.handle.startsWith("week-"))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => {
        const datePart = c.handle.replace("week-", "");
        const deliveryDate = new Date(datePart);
        const cutoffDate = new Date(deliveryDate);
        cutoffDate.setDate(deliveryDate.getDate() - 5);

        return {
          id: c.id,
          label: { tr: c.title, en: c.title },
          deliveryDate: datePart,
          cutoffDate: cutoffDate.toISOString(),
          isLocked: new Date() > cutoffDate,
        };
      })
      .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meals: PublicProduct[] = products.map((p: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tagsObj: any = {};
      // Parse tags... logic remains same but typed output
      p.tags.forEach((tag: string) => {
        const [key, val] = tag.split(":");
        if (key !== "allergen" && key !== "isPro") {
          tagsObj[key] = val;
          // Try parse number
          if (["prepTime", "kcal", "protein"].includes(key)) {
            tagsObj[key] = parseInt(val) || 0;
          }
        }
      });

      // Default if missing
      if (!tagsObj.category) tagsObj.category = "General";

      return {
        id: p.id,
        storeId: p.storeId,
        name: p.title,
        description: p.description || "",
        price: Number(p.price) || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        images: p.productImages?.map((img: any) => img.url) || [],
        variants: [],
        inStock: true,
        category: tagsObj.category,
        // Extra fields stored in tags for specific template can be part of 'specs' or custom fields
        // For now mapping to PublicProduct standard fields
        handle: p.handle,
      };
    });

    const response: PublicMenu = {
      weeks,
      meals,
    };

    return NextResponse.json(response, { headers: standardHeaders(requestId) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (error instanceof BaseError) throw error;
    logger.error("Failed to fetch menu", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      app: "storefront",
    });
    return NextResponse.json(
      { error: "Failed to fetch menu", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
