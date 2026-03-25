import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

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

      const recentPurchaseOrders = await prisma.wholesalePurchaseOrderItem.findMany({
        where: {
          productId: id,
          purchaseOrder: {
            storeId,
            status: { in: ["ordered", "received"] },
          },
        },
        include: {
          purchaseOrder: {
            select: {
              id: true,
              poNumber: true,
              status: true,
              createdAt: true,
              expectedDeliveryDate: true,
            },
          },
        },
        orderBy: { purchaseOrder: { createdAt: "desc" } },
        take: 10,
      });

      const recentSales = await prisma.wholesaleOrderItem.findMany({
        where: {
          productId: id,
          order: {
            storeId,
            status: { not: "cancelled" },
          },
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customer: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
              createdAt: true,
            },
          },
        },
        orderBy: { order: { createdAt: "desc" } },
        take: 10,
      });

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
        supplyChain: {
          recentPurchaseOrders: recentPurchaseOrders.map((po) => ({
            id: po.purchaseOrder.id,
            poNumber: po.purchaseOrder.poNumber,
            status: po.purchaseOrder.status,
            orderedQuantity: po.quantity,
            unitPrice: po.unitPrice,
            orderedDate: po.purchaseOrder.createdAt,
            expectedDelivery: po.purchaseOrder.expectedDeliveryDate,
          })),
          recentSales: recentSales.map((sale) => ({
            id: sale.order.id,
            orderNumber: sale.order.orderNumber,
            customer: sale.order.customer.companyName,
            quantity: sale.quantity,
            unitPrice: sale.unitPrice,
            totalPrice: sale.totalPrice,
            saleDate: sale.order.createdAt,
          })),
        },
      };

      return NextResponse.json(
        { data: productWithDetails },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: productId } = await params;
      logger.error("[WHOLESALE_PRODUCT_DETAILS_GET]", { error, productId });
      return NextResponse.json(
        { error: "Failed to fetch product details" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
