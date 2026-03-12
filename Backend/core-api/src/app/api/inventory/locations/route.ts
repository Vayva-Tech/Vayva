import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET /api/inventory/locations - List inventory locations
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId }) => {
    try {
      const locations = await prisma.inventoryLocation.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { inventoryItems: true },
          },
        },
      });

      // Get low stock counts for each location
      const locationsWithStats = await Promise.all(
        locations.map(async (loc) => {
          const lowStockItems = await prisma.inventoryItem.count({
            where: {
              locationId: loc.id,
              available: { lte: 5 },
            },
          });

          return {
            id: loc.id,
            name: loc.name,
            type: loc.type || "warehouse",
            address: loc.address || "",
            city: loc.city || "",
            state: loc.state || "",
            isDefault: loc.isDefault,
            stockCount: loc._count.inventoryItems,
            lowStockCount: lowStockItems,
            createdAt: loc.createdAt.toISOString(),
          };
        }),
      );

      return NextResponse.json(
        { locations: locationsWithStats },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[INVENTORY_LOCATIONS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load inventory locations" },
        { status: 500 },
      );
    }
  },
);

// POST /api/inventory/locations - Create new location
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const { name, type, address, city, state, isDefault } = body;

      if (!name || !type) {
        return NextResponse.json(
          { error: "Name and type are required" },
          { status: 400 },
        );
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await prisma.inventoryLocation.updateMany({
          where: { storeId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const location = await prisma.inventoryLocation.create({
        data: {
          storeId,
          name,
          type,
          address: address || null,
          city: city || null,
          state: state || null,
          isDefault: isDefault || false,
        },
      });

      return NextResponse.json(
        { location },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[INVENTORY_LOCATIONS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create inventory location" },
        { status: 500 },
      );
    }
  },
);
