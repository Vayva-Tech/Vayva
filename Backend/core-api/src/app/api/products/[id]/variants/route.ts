import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, FulfillmentStatus } from "@vayva/db";
import { InventoryService } from "@/services/inventory.service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseFulfillmentStatus(value: unknown): FulfillmentStatus | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toUpperCase();
  return (Object.values(FulfillmentStatus) as string[]).includes(normalized)
    ? (normalized as FulfillmentStatus)
    : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const variants = await prisma.productVariant.findMany({
        where: {
          productId: id,
          product: { storeId },
        },
        include: {
          inventoryItems: true,
        },
        orderBy: { position: "asc" },
      });

      return NextResponse.json(
        { variants },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[PRODUCT_VARIANTS_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const title = getString(body.title);
      const sku = getString(body.sku);
      const price = body.price;
      const barcode = getString(body.barcode);
      const _trackInventory =
        typeof body.trackInventory === "boolean"
          ? body.trackInventory
          : undefined;
      const inventoryQuantity = body.inventoryQuantity;
      const _status = parseFulfillmentStatus(body.status);

      if (!title || price === undefined) {
        return NextResponse.json(
          { error: "Title and price required" },
          { status: 400 },
        );
      }

      // Verify product ownership
      const product = await prisma.product.findFirst({
        where: { id, storeId },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      const variant = await prisma.productVariant.create({
        data: {
          productId: id,
          storeId,
          title,
          sku,
          price: Number(price),
          barcode,
          options: {}, // Default empty options if not provided
        },
      });

      // Handle initial inventory if provided
      if (inventoryQuantity !== undefined && Number(inventoryQuantity) > 0) {
        await InventoryService.adjustStock(
          storeId,
          variant.id,
          id,
          Number(inventoryQuantity),
          "INITIAL_STOCK",
          "Stock initialization",
          "SYSTEM",
        );
      }

      return NextResponse.json({ success: true, variant }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[PRODUCT_VARIANTS_POST]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
