import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const AdjustmentSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  locationId: z.string().optional(),
  delta: z.number().int(),
  reason: z.enum([
    "sale",
    "return",
    "purchase",
    "damage",
    "theft",
    "adjustment",
    "transfer",
    "cycle_count",
  ]),
  reference: z.string().optional(),
  note: z.string().optional(),
});

// GET /api/inventory/adjustments - List inventory adjustments
export const GET = withVayvaAPI(
  PERMISSIONS.INVENTORY_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const reason = searchParams.get("reason");
      const productId = searchParams.get("productId");

      const where: any = { storeId };

      if (reason) where.reason = reason;
      if (productId) where.productId = productId;

      const [adjustments, total] = await Promise.all([
        prisma.inventoryAdjustment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            product: { select: { name: true } },
            productVariant: { select: { title: true } },
            location: { select: { name: true } },
          },
        }),
        prisma.inventoryAdjustment.count({ where }),
      ]);

      return NextResponse.json(
        {
          adjustments: adjustments.map(adj => ({
            id: adj.id,
            productId: adj.productId,
            variantId: adj.variantId,
            locationId: adj.locationId,
            productName: adj.product?.name,
            variantName: adj.productVariant?.title,
            locationName: adj.location?.name,
            delta: adj.delta,
            reason: adj.reason,
            reference: adj.reference,
            note: adj.note,
            adjustedBy: adj.adjustedBy,
            createdAt: adj.createdAt.toISOString(),
          })),
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
      logger.error("[INVENTORY_ADJUSTMENTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load inventory adjustments" },
        { status: 500 },
      );
    }
  },
);

// POST /api/inventory/adjustments - Create inventory adjustment
export const POST = withVayvaAPI(
  PERMISSIONS.INVENTORY_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const body = await req.json();
      const result = AdjustmentSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const { productId, variantId, locationId, delta, reason, reference, note } = result.data;

      // Validate that either productId or variantId is provided
      if (!productId && !variantId) {
        return NextResponse.json(
          { error: "Either productId or variantId is required" },
          { status: 400 },
        );
      }

      // If variantId provided, get the productId
      let finalProductId = productId;
      if (variantId && !productId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId },
          select: { productId: true },
        });
        if (!variant) {
          return NextResponse.json(
            { error: "Variant not found" },
            { status: 404 },
          );
        }
        finalProductId = variant.productId;
      }

      // Validate location if provided
      if (locationId) {
        const location = await prisma.inventoryLocation.findUnique({
          where: { id: locationId },
          select: { storeId: true },
        });
        if (!location || location.storeId !== storeId) {
          return NextResponse.json(
            { error: "Location not found or access denied" },
            { status: 404 },
          );
        }
      }

      // Create the adjustment record
      const adjustment = await prisma.inventoryAdjustment.create({
        data: {
          storeId,
          productId: finalProductId,
          variantId,
          locationId,
          delta,
          reason,
          reference,
          note,
          adjustedBy: user?.id,
        },
      });

      // Update inventory item quantities
      if (finalProductId) {
        const where: any = { productId: finalProductId };
        if (variantId) where.variantId = variantId;
        if (locationId) where.locationId = locationId;

        const inventoryItem = await prisma.inventoryItem.findFirst({ where });

        if (inventoryItem) {
          // Update existing inventory item
          await prisma.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              onHand: {
                increment: delta,
              },
              available: {
                increment: delta,
              },
            },
          });
        } else if (delta > 0) {
          // Create new inventory item if positive adjustment and doesn't exist
          await prisma.inventoryItem.create({
            data: {
              storeId,
              productId: finalProductId,
              variantId: variantId || "",
              locationId: locationId || "",
              onHand: delta,
              available: delta,
              reserved: 0,
            },
          });
        }
      }

      return NextResponse.json(
        { adjustment },
        {
          status: 201,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[INVENTORY_ADJUSTMENTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create inventory adjustment" },
        { status: 500 },
      );
    }
  },
);