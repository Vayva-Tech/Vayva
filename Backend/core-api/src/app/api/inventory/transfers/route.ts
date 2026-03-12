import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET /api/inventory/transfers - List stock transfers
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId }) => {
    try {
      const transfers = await prisma.stockTransfer.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        include: {
          fromLocation: { select: { id: true, name: true } },
          toLocation: { select: { id: true, name: true } },
        },
      });

      const formattedTransfers = transfers.map((t) => ({
        id: t.id,
        fromLocationId: t.fromLocationId,
        fromLocationName: t.fromLocation?.name || "Unknown",
        toLocationId: t.toLocationId,
        toLocationName: t.toLocation?.name || "Unknown",
        items: t.items as Array<{variantId: string; quantity: number; notes?: string}>,
        totalItems: t.totalItems,
        status: t.status,
        notes: t.notes,
        requestorId: t.requestorId,
        approverId: t.approverId,
        sentAt: t.sentAt?.toISOString(),
        receivedAt: t.receivedAt?.toISOString(),
        createdAt: t.createdAt.toISOString(),
      }));

      return NextResponse.json(
        { transfers: formattedTransfers },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[INVENTORY_TRANSFERS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load stock transfers" },
        { status: 500 },
      );
    }
  },
);

// POST /api/inventory/transfers - Create stock transfer
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const { fromLocationId, toLocationId, items, notes, requestorId } = body;

      if (!fromLocationId || !toLocationId || !items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: "Source location, destination location, and items are required" },
          { status: 400 },
        );
      }

      if (fromLocationId === toLocationId) {
        return NextResponse.json(
          { error: "Source and destination must be different" },
          { status: 400 },
        );
      }

      // Validate items structure
      const validItems = items.filter((item: {variantId?: string; quantity?: number}) => 
        item.variantId && typeof item.quantity === "number" && item.quantity > 0
      );

      if (validItems.length === 0) {
        return NextResponse.json(
          { error: "At least one valid item with variantId and quantity is required" },
          { status: 400 },
        );
      }

      const totalItems = validItems.reduce((sum: number, item: {quantity: number}) => sum + item.quantity, 0);

      const transfer = await prisma.stockTransfer.create({
        data: {
          storeId,
          fromLocationId,
          toLocationId,
          items: validItems,
          totalItems,
          notes: notes || null,
          requestorId: requestorId || null,
          status: "PENDING",
        },
      });

      return NextResponse.json(
        { transfer },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[INVENTORY_TRANSFERS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create stock transfer" },
        { status: 500 },
      );
    }
  },
);
