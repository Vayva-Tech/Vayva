import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId, params }) => {
    const { id: productId } = await params;
    try {
      // Fetch movements linked to variants of this product
      const variants = await prisma.productVariant.findMany({
        where: { productId, product: { storeId } },
        select: { id: true, title: true },
      });
      const variantIds = variants.map((v) => v.id);

      const movements = await prisma.inventoryMovement.findMany({
        where: {
          storeId,
          variantId: { in: variantIds },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          inventoryLocation: true,
        },
      });

      // Enhance with variant names
      const enriched = movements.map((m) => ({
        ...m,
        variantName:
          variants.find((v) => v.id === m.variantId)?.title ||
          "Unknown Variant",
      }));

      return NextResponse.json(enriched, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[INVENTORY_HISTORY_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
