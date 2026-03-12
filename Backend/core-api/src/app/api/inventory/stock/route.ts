import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET /api/inventory/stock - Get stock levels
export const GET = withVayvaAPI(
  PERMISSIONS.INVENTORY_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const productId = searchParams.get("productId");
      const locationId = searchParams.get("locationId");
      const lowStockOnly = searchParams.get("lowStockOnly") === "true";
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");

      const where: any = { storeId };

      if (productId) where.productId = productId;
      if (locationId) where.locationId = locationId;
      if (lowStockOnly) {
        where.OR = [
          { available: { lte: 5 } },
          { onHand: { lte: 5 } },
        ];
      }

      const [items, total] = await Promise.all([
        prisma.inventoryItem.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [
            { product: { name: "asc" } },
            { productVariant: { title: "asc" } },
          ],
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: true,
              },
            },
            productVariant: {
              select: {
                title: true,
                sku: true,
              },
            },
            location: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        }),
        prisma.inventoryItem.count({ where }),
      ]);

      const stockLevels = items.map(item => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        locationId: item.locationId,
        productName: item.product?.name || "Unknown Product",
        productSlug: item.product?.slug || "",
        productImage: item.product?.images?.[0] || "",
        variantTitle: item.productVariant?.title || "Default",
        variantSku: item.productVariant?.sku || "",
        locationName: item.location?.name || "Unknown Location",
        locationType: item.location?.type || "warehouse",
        onHand: item.onHand,
        reserved: item.reserved,
        available: item.available,
        isLowStock: item.available <= 5 || item.onHand <= 5,
        isOutOfStock: item.available <= 0,
        lastUpdatedAt: item.updatedAt.toISOString(),
      }));

      return NextResponse.json(
        {
          stockLevels,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[INVENTORY_STOCK_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load stock levels" },
        { status: 500 },
      );
    }
  },
);

// PUT /api/inventory/stock/:id - Update stock level
export const PUT = withVayvaAPI(
  PERMISSIONS.INVENTORY_MANAGE,
  async (req, { storeId, params }) => {
    try {
      const itemId = params.id;
      const body = await req.json();
      const { onHand, reserved } = body;

      if (onHand === undefined && reserved === undefined) {
        return NextResponse.json(
          { error: "Either onHand or reserved must be provided" },
          { status: 400 },
        );
      }

      // Verify the item exists and belongs to the store
      const existingItem = await prisma.inventoryItem.findUnique({
        where: { id: itemId },
        select: { storeId: true, available: true, onHand: true, reserved: true },
      });

      if (!existingItem) {
        return NextResponse.json(
          { error: "Inventory item not found" },
          { status: 404 },
        );
      }

      if (existingItem.storeId !== storeId) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 },
        );
      }

      // Calculate new values
      const newOnHand = onHand !== undefined ? onHand : existingItem.onHand;
      const newReserved = reserved !== undefined ? reserved : existingItem.reserved;
      const newAvailable = newOnHand - newReserved;

      // Validate available stock isn't negative
      if (newAvailable < 0) {
        return NextResponse.json(
          { error: "Available stock cannot be negative" },
          { status: 400 },
        );
      }

      const updatedItem = await prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
          onHand: newOnHand,
          reserved: newReserved,
          available: newAvailable,
          updatedAt: new Date(),
        },
        include: {
          product: {
            select: { name: true },
          },
          productVariant: {
            select: { title: true },
          },
          location: {
            select: { name: true },
          },
        },
      });

      // Create adjustment record for audit trail
      await prisma.inventoryAdjustment.create({
        data: {
          storeId,
          productId: updatedItem.productId,
          variantId: updatedItem.variantId,
          locationId: updatedItem.locationId,
          delta: newOnHand - existingItem.onHand,
          reason: "adjustment",
          note: `Manual stock level update: ${existingItem.onHand} → ${newOnHand}`,
        },
      });

      return NextResponse.json(
        {
          stockLevel: {
            id: updatedItem.id,
            productId: updatedItem.productId,
            variantId: updatedItem.variantId,
            locationId: updatedItem.locationId,
            productName: updatedItem.product?.name || "Unknown Product",
            variantTitle: updatedItem.productVariant?.title || "Default",
            locationName: updatedItem.location?.name || "Unknown Location",
            onHand: updatedItem.onHand,
            reserved: updatedItem.reserved,
            available: updatedItem.available,
            isLowStock: updatedItem.available <= 5,
            isOutOfStock: updatedItem.available <= 0,
            lastUpdatedAt: updatedItem.updatedAt.toISOString(),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[INVENTORY_STOCK_PUT]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update stock level" },
        { status: 500 },
      );
    }
  },
);