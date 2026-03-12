import { NextResponse } from "next/server";
import { prisma, Prisma } from "@/lib/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { sanitizeHtml } from "@/lib/input-sanitization";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const product = await prisma.product.findUnique({
        where: { id, storeId },
        include: {
          productVariants: {
            include: {
              inventoryItems: true,
            },
          },
        },
      });
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }
      const formatted = {
        id: product.id,
        name: product.title,
        description: product.description,
        status: product.status === "ACTIVE" ? "active" : "draft",
        price: Number(product.price),
        inventory: product.productVariants.reduce(
          (acc, v) => acc + (v.inventoryItems[0]?.available || 0),
          0,
        ),
        category: product.productType,
        images: [],
        variants: product.productVariants.map((v) => ({
          id: v.id,
          name: v.title,
          price: Number(v.price),
          inventory: v.inventoryItems[0]?.available || 0,
          sku: v.sku,
        })),
        updatedAt: product.updatedAt.toISOString(),
      };
      return NextResponse.json(formatted, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[PRODUCT_ITEM_GET_BY_ID]", error, {
        storeId,
        productId: id,
      });
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 500 },
      );
    }
  },
);
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const parsedBody: unknown = await request.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      // 1. Get Default Location
      let location = await prisma.inventoryLocation.findFirst({
        where: { storeId, isDefault: true },
      });
      if (!location) {
        // Auto-create default location if missing
        location = await prisma.inventoryLocation.create({
          data: {
            storeId,
            name: "Default Location",
            isDefault: true,
          },
        });
      }
      const locationId = location.id;
      // 2. Update Product Basics
      const updated = await prisma.product.update({
        where: { id, storeId },
        data: {
          title: getString(body.name),
          description:
            typeof body.description === "string"
              ? sanitizeHtml(body.description)
              : undefined,
          status: body.status === "active" ? "ACTIVE" : "DRAFT",
          price: body.price ? parseFloat(String(body.price)) : undefined,
        },
      });
      // 3. Handle Variants (Re-create strategy for MVP)
      if (Array.isArray(body.variants)) {
        await prisma.inventoryItem.deleteMany({ where: { productId: id } });
        await prisma.productVariant.deleteMany({ where: { productId: id } });
        const variants = body.variants.filter(isRecord);
        for (const v of variants) {
          const variantSku = getString(v.sku);
          const variant = await prisma.productVariant.create({
            data: {
              productId: id,
              storeId,
              title: String(v.name || ""),
              price: v.price ? parseFloat(String(v.price)) : 0,
              sku: variantSku ?? null,
              options: [] as Prisma.InputJsonValue, // Required by schema
            },
          });
          // Create Inventory Item
          await prisma.inventoryItem.create({
            data: {
              locationId,
              variantId: variant.id,
              productId: id,
              onHand: Number(v.inventory || 0),
              available: Number(v.inventory || 0),
            },
          });
        }
      }
      return NextResponse.json(updated);
    } catch (error: unknown) {
      logger.error("[PRODUCT_ITEM_UPDATE_PUT]", error, {
        storeId,
        productId: id,
        userId: user.id,
      });
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
  },
);
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      // Clean up inventory items first (FK constraint)
      await prisma.inventoryItem.deleteMany({ where: { productId: id } });
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      await prisma.product.delete({
        where: { id, storeId },
      });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[PRODUCT_ITEM_DELETE]", error, {
        storeId,
        productId: id,
        userId: user.id,
      });
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
  },
);
