import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
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
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
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

      // Get sales history
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
    } catch (error: unknown) {
      logger.error("[BEAUTY_INVENTORY_ID_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/beauty/inventory/[id]
 * Update an existing product
 */
export const PUT = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const validatedData = updateProductSchema.parse(body);

      // Verify product exists
      const existingProduct = await prisma.product.findUnique({
        where: {
          id,
          merchantId: storeId,
        },
      });

      if (!existingProduct) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Check if new SKU already exists
      if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
        const skuExists = await prisma.product.findFirst({
          where: {
            merchantId: storeId,
            sku: validatedData.sku,
            id: { not: id },
          },
        });

        if (skuExists) {
          return NextResponse.json(
            { error: "SKU already exists" },
            { status: 400 }
          );
        }
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: validatedData,
      });

      logger.info("[BEAUTY_INVENTORY_ID_PUT] Product updated", { 
        productId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: updatedProduct,
        message: "Product updated successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }
      
      logger.error("[BEAUTY_INVENTORY_ID_PUT_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/beauty/inventory/[id]
 * Delete a product (soft delete)
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      // Verify product exists
      const existingProduct = await prisma.product.findUnique({
        where: {
          id,
          merchantId: storeId,
        },
      });

      if (!existingProduct) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Check if product has associated orders
      const orderCount = await prisma.orderItem.count({
        where: {
          productId: id,
        },
      });

      if (orderCount > 0) {
        // Soft delete by setting status to discontinued
        await prisma.product.update({
          where: { id },
          data: {
            status: "discontinued",
          },
        });

        logger.info("[BEAUTY_INVENTORY_ID_DELETE] Product discontinued", { 
          productId: id,
          storeId 
        });

        return NextResponse.json({
          success: true,
          message: "Product discontinued (has order history)",
        });
      }

      // Hard delete if no order history
      await prisma.product.delete({
        where: { id },
      });

      logger.info("[BEAUTY_INVENTORY_ID_DELETE] Product deleted", { 
        productId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_INVENTORY_ID_DELETE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }
  }
);
