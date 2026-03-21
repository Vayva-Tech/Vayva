// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { z } from "zod";

const updateProductSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().optional(),
  costPrice: z.number().optional(),
  stockQuantity: z.number().optional(),
  lowStockThreshold: z.number().optional(),
  inventoryTracking: z.boolean().optional(),
  productType: z.enum(["RETAIL", "PROFESSIONAL"]).optional(),
  supplier: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["active", "inactive", "discontinued"]).optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/beauty/inventory/[id]
 * Get specific product details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: {
        id,
        merchantId: storeId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: id,
      },
      include: {
        order: {
          select: {
            createdAt: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        salesHistory: orderItems,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/inventory/[id]",
      operation: "GET_INVENTORY_ITEM",
    });
    return NextResponse.json(
      { error: "Failed to fetch inventory item" },
      { status: 500 }
    );
  }
}
