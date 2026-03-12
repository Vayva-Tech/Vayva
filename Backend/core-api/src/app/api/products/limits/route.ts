import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isKeyOf<T extends object>(obj: T, key: PropertyKey): key is keyof T {
  return key in obj;
}

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { plan: true },
      });

      // Simplified plan limits for now
      const plan = store?.plan || "FREE";
      const limits = {
        FREE: { products: 10, imagesPerProduct: 3, variantsPerProduct: 3 },
        GROWTH: { products: 50, imagesPerProduct: 10, variantsPerProduct: 10 },
        PRO: { products: 1000, imagesPerProduct: 50, variantsPerProduct: 50 },
      };

      const planKey = isKeyOf(limits, plan) ? plan : "FREE";
      const currentLimits = limits[planKey];

      const productsCount = await prisma.product.count({
        where: { storeId, status: { not: "ARCHIVED" } },
      });

      return NextResponse.json(
        {
          plan,
          limits: currentLimits,
          usage: {
            products: productsCount,
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[PRODUCTS_LIMITS]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
