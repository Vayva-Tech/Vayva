import { NextResponse } from "next/server";
import { prisma, Prisma } from "@/lib/db";
import { InventoryService } from "@/services/inventory.service";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (_req, { storeId, params }) => {
    const { id: productId, variantId } = await params;
    try {
      const deleted = await prisma.productVariant.deleteMany({
        where: {
          id: variantId,
          productId,
          product: { storeId },
        },
      });

      if (deleted.count === 0) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[VARIANT_DELETE]", error, {
        storeId,
        productId,
        variantId,
      });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params, user }) => {
    const { id: productId, variantId } = await params;
    try {
      const body: unknown = await req.json().catch(() => ({}));
      const b = isRecord(body) ? body : {};
      const price =
        b.price !== undefined ? parseFloat(String(b.price)) : undefined;
      const sku = typeof b.sku === "string" ? b.sku : undefined;
      const stock = b.stock !== undefined ? String(b.stock) : undefined;
      const title = typeof b.title === "string" ? b.title : undefined;
      const options =
        b.options !== undefined
          ? (b.options as Prisma.InputJsonValue)
          : undefined;

      const variant = await prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
          product: { storeId },
        },
        include: { inventoryItems: true },
      });

      if (!variant) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 },
        );
      }

      const updated = await prisma.productVariant.updateMany({
        where: {
          id: variantId,
          productId,
          product: { storeId },
        },
        data: {
          price,
          sku,
          title,
          options,
        },
      });

      if (updated.count === 0) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 },
        );
      }

      if (stock !== undefined) {
        const newStock = parseInt(stock, 10);
        const currentStock = variant.inventoryItems.reduce(
          (acc, i) => acc + i.onHand,
          0,
        );
        const diff = newStock - currentStock;
        if (diff !== 0) {
          await InventoryService.adjustStock(
            storeId,
            variantId,
            productId,
            diff,
            "Manual Update from Admin",
            user.id,
          );
        }
      }

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[VARIANT_PATCH]", error, { storeId, productId, variantId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
