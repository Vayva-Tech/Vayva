import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface PlanLimit {
  products: number;
  imagesPerProduct: number;
  variantsPerProduct: number;
}

const limits: Record<string, PlanLimit> = {
  FREE: { products: 10, imagesPerProduct: 3, variantsPerProduct: 3 },
  GROWTH: { products: 50, imagesPerProduct: 10, variantsPerProduct: 10 },
  PRO: { products: 1000, imagesPerProduct: 50, variantsPerProduct: 50 },
};

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { plan: true },
        });

        const plan = store?.plan || "FREE";
        const currentLimits = limits[plan] ?? limits.FREE;

        const productsCount = await prisma.product?.count({
            where: { storeId, status: { not: "ARCHIVED" } },
        });

        return NextResponse.json({
            plan,
            limits: currentLimits,
            usage: {
                products: productsCount,
            },
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[PRODUCTS_LIMITS_GET] Failed to fetch product limits", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
