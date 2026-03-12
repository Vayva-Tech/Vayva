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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify product exists
    const product = await prisma.groceryProduct.findFirst({
      where: { id, storeId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get stock history
    const stockHistory = await prisma.groceryStockMovement.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Calculate current stock level
    const totalMovements = stockHistory.reduce(
      (sum, movement) => sum + movement.quantityChange,
      0
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
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_STOCK_GET]", { error, productId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch stock information" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const json = await req.json().catch(() => ({}));
    const parseResult = StockAdjustmentSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid stock adjustment data",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const { quantity, reason, notes, referenceNumber } = parseResult.data;

    // Get current product
    const product = await prisma.groceryProduct.findFirst({
      where: { id, storeId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Update stock quantity
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
          createdBy: "system", // Would come from auth context
        },
      }),
    ]);

    logger.info("[GROCERY_STOCK_ADJUST]", {
      productId: id,
      quantityChange: quantity,
      reason,
      newStock,
    });

    return NextResponse.json(
      { 
        data: { 
          product: updatedProduct,
          movement: stockMovement 
        } 
      },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_STOCK_ADJUST]", { error, productId: params.id });
    return NextResponse.json(
      { error: "Failed to adjust stock" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}