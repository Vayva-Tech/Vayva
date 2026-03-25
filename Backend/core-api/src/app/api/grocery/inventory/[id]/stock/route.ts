import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const StockAdjustmentSchema = z.object({
  quantity: z.number().int(),
  reason: z.enum([
    "received",
    "sold",
    "damaged",
    "expired",
    "theft",
    "adjustment",
    "returned",
  ]),
  notes: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.INVENTORY_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const product = await prisma.groceryProduct.findFirst({
        where: { id, storeId },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const stockHistory = await prisma.groceryStockMovement.findMany({
        where: {
          productId: id,
          product: { storeId },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const totalMovements = stockHistory.reduce(
        (sum, movement) => sum + movement.quantityChange,
        0,
      );

      const stockData = {
        currentStock: product.stockQuantity,
        calculatedStock: totalMovements,
        discrepancy: product.stockQuantity - totalMovements,
        lastUpdated: product.updatedAt,
        history: stockHistory,
      };

      return NextResponse.json(
        { data: stockData },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: productId } = await params;
      logger.error("[GROCERY_STOCK_GET]", { error, productId });
      return NextResponse.json(
        { error: "Failed to fetch stock information" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.INVENTORY_MANAGE,
  async (req: NextRequest, { storeId, params, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const json = await req.json().catch(() => ({}));
      const parseResult = StockAdjustmentSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid stock adjustment data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { quantity, reason, notes, referenceNumber } = parseResult.data;

      const product = await prisma.groceryProduct.findFirst({
        where: { id, storeId },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const newStock = Math.max(0, product.stockQuantity + quantity);

      const [updatedProduct, stockMovement] = await prisma.$transaction([
        prisma.groceryProduct.update({
          where: { id_storeId: { id, storeId } },
          data: {
            stockQuantity: newStock,
            lowStockAlert: newStock <= product.reorderPoint,
          },
        }),
        prisma.groceryStockMovement.create({
          data: {
            productId: id,
            quantityChange: quantity,
            reason,
            notes,
            referenceNumber,
            createdBy: user.id,
          },
        }),
      ]);

      logger.info("[GROCERY_STOCK_ADJUST]", {
        productId: id,
        quantityChange: quantity,
        reason,
        newStock,
        userId: user.id,
      });

      return NextResponse.json(
        {
          data: {
            product: updatedProduct,
            movement: stockMovement,
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: productId } = await params;
      logger.error("[GROCERY_STOCK_ADJUST]", { error, productId });
      return NextResponse.json(
        { error: "Failed to adjust stock" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
