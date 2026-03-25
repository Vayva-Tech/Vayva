import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ProductUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  unitPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  unitOfMeasure: z.string().min(1).optional(),
  weight: z.number().positive().optional(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
  minimumOrderQuantity: z.number().int().positive().optional(),
  leadTimeDays: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  specifications: z.record(z.unknown()).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const product = await prisma.wholesaleProduct.findFirst({
        where: { id, storeId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              contactEmail: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
              inventoryMovements: true,
            },
          },
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const inventory = await prisma.wholesaleInventory.findFirst({
        where: { productId: id, storeId },
      });

      const recentSales = await prisma.wholesaleOrderItem.findMany({
        where: {
          productId: id,
          order: {
            storeId,
            status: "delivered",
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
          },
        },
        select: {
          quantity: true,
          totalPrice: true,
          order: {
            select: {
              createdAt: true,
            },
          },
        },
        orderBy: { order: { createdAt: "desc" } },
        take: 20,
      });

      const totalQuantitySold = recentSales.reduce(
        (sum, sale) => sum + sale.quantity,
        0,
      );
      const totalRevenue = recentSales.reduce(
        (sum, sale) => sum + sale.totalPrice,
        0,
      );
      const averageSellingPrice =
        recentSales.length > 0 && totalQuantitySold > 0
          ? totalRevenue / totalQuantitySold
          : product.unitPrice;

      const productWithDetails = {
        ...product,
        inventory: {
          currentStock: inventory?.currentStock || 0,
          reservedStock: inventory?.reservedStock || 0,
          availableStock: inventory
            ? inventory.currentStock - inventory.reservedStock
            : 0,
          reorderPoint: inventory?.reorderPoint || 0,
          lowStockAlert: inventory?.lowStockAlert || false,
        },
        salesMetrics: {
          totalQuantitySold,
          totalRevenue,
          averageSellingPrice,
          recentSalesCount: recentSales.length,
        },
      };

      return NextResponse.json(
        { data: productWithDetails },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: productId } = await params;
      logger.error("[WHOLESALE_PRODUCT_GET]", { error, productId });
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.WHOLESALE_MANAGE,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const json = await req.json().catch(() => ({}));
      const parseResult = ProductUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid product data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const updatedProduct = await prisma.wholesaleProduct.update({
        where: { id_storeId: { id, storeId } },
        data: {
          ...parseResult.data,
          specifications: parseResult.data.specifications
            ? JSON.stringify(parseResult.data.specifications)
            : undefined,
        },
      });

      logger.info("[WHOLESALE_PRODUCT_UPDATE]", {
        productId: id,
        updatedFields: Object.keys(parseResult.data),
      });

      return NextResponse.json(
        { data: updatedProduct },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: productId } = await params;
      logger.error("[WHOLESALE_PRODUCT_UPDATE]", { error, productId });
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.WHOLESALE_MANAGE,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const activeOrderItems = await prisma.wholesaleOrderItem.count({
        where: {
          productId: id,
          order: {
            storeId,
            status: { in: ["pending", "processing", "shipped"] },
          },
        },
      });

      if (activeOrderItems > 0) {
        return NextResponse.json(
          { error: "Cannot delete product with active orders" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      await prisma.$transaction([
        prisma.wholesaleInventory.deleteMany({
          where: { productId: id, storeId },
        }),
        prisma.wholesaleProduct.delete({
          where: { id_storeId: { id, storeId } },
        }),
      ]);

      logger.info("[WHOLESALE_PRODUCT_DELETE]", { productId: id });

      return NextResponse.json(
        { message: "Product deleted successfully" },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: productId } = await params;
      logger.error("[WHOLESALE_PRODUCT_DELETE]", { error, productId });
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
