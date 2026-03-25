import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET /api/inventory/multi-location - Get multi-location stock overview
export const GET = withVayvaAPI(
  PERMISSIONS.INVENTORY_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const productId = searchParams.get("productId");
      const variantId = searchParams.get("variantId");

      if (!productId) {
        return NextResponse.json(
          { error: "productId is required" },
          { status: 400 },
        );
      }

      const where: any = { 
        storeId,
        productId,
      };

      if (variantId) {
        where.variantId = variantId;
      }

      const stockItems = await prisma.inventoryItem.findMany({
        where,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              type: true,
              address: true,
              city: true,
              state: true,
            },
          },
          productVariant: {
            select: {
              title: true,
              sku: true,
            },
          },
        },
        orderBy: {
          location: { name: "asc" },
        },
      });

      // Aggregate totals
      const totals = stockItems.reduce(
        (acc, item) => {
          acc.totalOnHand += item.onHand;
          acc.totalReserved += item.reserved;
          acc.totalAvailable += item.available;
          return acc;
        },
        { totalOnHand: 0, totalReserved: 0, totalAvailable: 0 },
      );

      const locations = stockItems.map(item => ({
        locationId: item.locationId,
        locationName: item.location?.name || "Unknown Location",
        locationType: item.location?.type || "warehouse",
        locationAddress: item.location?.address || "",
        locationCity: item.location?.city || "",
        locationState: item.location?.state || "",
        onHand: item.onHand,
        reserved: item.reserved,
        available: item.available,
        isLowStock: item.available <= 5,
        variantTitle: item.productVariant?.title || "Default",
        variantSku: item.productVariant?.sku || "",
      }));

      return NextResponse.json(
        {
          productId,
          variantId: variantId || null,
          totals,
          locations,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[INVENTORY_MULTI_LOCATION_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load multi-location stock" },
        { status: 500 },
      );
    }
  },
);

// POST /api/inventory/multi-location/transfer - Transfer stock between locations
export const POST = withVayvaAPI(
  PERMISSIONS.INVENTORY_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const body = await req.json();
      const { 
        productId, 
        variantId, 
        fromLocationId, 
        toLocationId, 
        quantity,
        reference,
        note 
      } = body;

      // Validation
      if (!productId || !fromLocationId || !toLocationId || !quantity) {
        return NextResponse.json(
          { error: "productId, fromLocationId, toLocationId, and quantity are required" },
          { status: 400 },
        );
      }

      if (fromLocationId === toLocationId) {
        return NextResponse.json(
          { error: "Cannot transfer to the same location" },
          { status: 400 },
        );
      }

      if (quantity <= 0) {
        return NextResponse.json(
          { error: "Quantity must be greater than 0" },
          { status: 400 },
        );
      }

      // Verify locations exist and belong to store
      const [fromLocation, toLocation] = await Promise.all([
        prisma.inventoryLocation.findUnique({
          where: { id: fromLocationId },
        }),
        prisma.inventoryLocation.findUnique({
          where: { id: toLocationId },
        }),
      ]);

      if (!fromLocation || fromLocation.storeId !== storeId) {
        return NextResponse.json(
          { error: "Source location not found or access denied" },
          { status: 404 },
        );
      }

      if (!toLocation || toLocation.storeId !== storeId) {
        return NextResponse.json(
          { error: "Destination location not found or access denied" },
          { status: 404 },
        );
      }

      // Check source location has enough stock
      const fromStockWhere: any = { 
        productId, 
        locationId: fromLocationId 
      };
      
      if (variantId) fromStockWhere.variantId = variantId;

      const fromStock = await prisma.inventoryItem.findFirst({
        where: fromStockWhere,
      });

      if (!fromStock || fromStock.available < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock in source location" },
          { status: 400 },
        );
      }

      // Perform the transfer using a transaction
      const _result = await prisma.$transaction(async (tx) => {
        // Decrease stock in source location
        const updatedFrom = await tx.inventoryItem.update({
          where: { id: fromStock.id },
          data: {
            onHand: { decrement: quantity },
            available: { decrement: quantity },
            updatedAt: new Date(),
          },
        });

        // Get or create destination stock item
        const toStockWhere: any = { 
          productId, 
          locationId: toLocationId 
        };
        
        if (variantId) toStockWhere.variantId = variantId;

        let toStock = await tx.inventoryItem.findFirst({
          where: toStockWhere,
        });

        if (toStock) {
          // Update existing inventory item
          toStock = await tx.inventoryItem.update({
            where: { id: toStock.id },
            data: {
              onHand: { increment: quantity },
              available: { increment: quantity },
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new inventory item
          toStock = await tx.inventoryItem.create({
            data: {
              storeId,
              productId,
              variantId: variantId || "",
              locationId: toLocationId,
              onHand: quantity,
              available: quantity,
              reserved: 0,
            },
          });
        }

        // Create adjustment records for audit trail
        await tx.inventoryAdjustment.create({
          data: {
            storeId,
            productId,
            variantId,
            locationId: fromLocationId,
            delta: -quantity,
            reason: "transfer",
            reference: reference || `Transfer to ${toLocation.name}`,
            note: note || `Transferred ${quantity} units to ${toLocation.name}`,
            adjustedBy: user?.id,
          },
        });

        await tx.inventoryAdjustment.create({
          data: {
            storeId,
            productId,
            variantId,
            locationId: toLocationId,
            delta: quantity,
            reason: "transfer",
            reference: reference || `Transfer from ${fromLocation.name}`,
            note: note || `Received ${quantity} units from ${fromLocation.name}`,
            adjustedBy: user?.id,
          },
        });

        return { updatedFrom, toStock };
      });

      return NextResponse.json(
        {
          transfer: {
            fromLocationId,
            toLocationId,
            fromLocationName: fromLocation.name,
            toLocationName: toLocation.name,
            productId,
            variantId,
            quantity,
            reference,
            note,
            transferredAt: new Date().toISOString(),
          },
        },
        {
          status: 201,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[INVENTORY_MULTI_LOCATION_TRANSFER]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to transfer stock between locations" },
        { status: 500 },
      );
    }
  },
);