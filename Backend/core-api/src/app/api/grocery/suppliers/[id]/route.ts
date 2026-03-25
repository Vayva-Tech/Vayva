import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const SupplierUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  contactName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(1).optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  website: z.string().url().optional(),
  paymentTerms: z.number().int().positive().optional(),
  minimumOrder: z.number().nonnegative().optional(),
  shippingInfo: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPLIERS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const supplier = await prisma.grocerySupplier.findFirst({
        where: { id, storeId },
        include: {
          _count: {
            select: {
              products: true,
              purchaseOrders: true,
            },
          },
        },
      });

      if (!supplier) {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const performanceMetrics = await getSupplierPerformance(id, storeId);

      const supplierWithMetrics = {
        ...supplier,
        performance: performanceMetrics,
      };

      return NextResponse.json(
        { data: supplierWithMetrics },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: supplierId } = await params;
      logger.error("[GROCERY_SUPPLIER_GET]", { error, supplierId });
      return NextResponse.json(
        { error: "Failed to fetch supplier" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.SUPPLIERS_MANAGE,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const json = await req.json().catch(() => ({}));
      const parseResult = SupplierUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid supplier data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const updatedSupplier = await prisma.grocerySupplier.update({
        where: { id_storeId: { id, storeId } },
        data: parseResult.data,
      });

      logger.info("[GROCERY_SUPPLIER_UPDATE]", {
        supplierId: id,
        updatedFields: Object.keys(parseResult.data),
      });

      return NextResponse.json(
        { data: updatedSupplier },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: supplierId } = await params;
      logger.error("[GROCERY_SUPPLIER_UPDATE]", { error, supplierId });
      return NextResponse.json(
        { error: "Failed to update supplier" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.SUPPLIERS_MANAGE,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const [activeProducts, activeOrders] = await Promise.all([
        prisma.groceryProduct.count({
          where: { supplierId: id, storeId, active: true },
        }),
        prisma.groceryPurchaseOrder.count({
          where: {
            supplierId: id,
            storeId,
            status: { in: ["pending", "processing"] },
          },
        }),
      ]);

      if (activeProducts > 0 || activeOrders > 0) {
        return NextResponse.json(
          { error: "Cannot delete supplier with active products or orders" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      await prisma.grocerySupplier.delete({
        where: { id_storeId: { id, storeId } },
      });

      logger.info("[GROCERY_SUPPLIER_DELETE]", { supplierId: id });

      return NextResponse.json(
        { message: "Supplier deleted successfully" },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: supplierId } = await params;
      logger.error("[GROCERY_SUPPLIER_DELETE]", { error, supplierId });
      return NextResponse.json(
        { error: "Failed to delete supplier" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

async function getSupplierPerformance(supplierId: string, storeId: string) {
  const [products, orders, reviews] = await Promise.all([
    prisma.groceryProduct.findMany({
      where: { supplierId, storeId },
      select: {
        id: true,
        stockQuantity: true,
        lowStockAlert: true,
        averageRating: true,
        totalRevenue: true,
      },
    }),
    prisma.groceryPurchaseOrder.findMany({
      where: {
        supplierId,
        storeId,
        status: "completed",
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      select: {
        totalAmount: true,
        deliveryDate: true,
        expectedDelivery: true,
      },
    }),
    prisma.groceryProductReview.findMany({
      where: {
        product: { supplierId, storeId },
      },
      select: {
        rating: true,
      },
    }),
  ]);

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.lowStockAlert).length;
  const averageProductRating =
    products.length > 0
      ? products.reduce((sum, p) => sum + (p.averageRating || 0), 0) /
        products.length
      : 0;

  const totalRevenue = products.reduce(
    (sum, p) => sum + (p.totalRevenue || 0),
    0,
  );

  const onTimeDeliveries = orders.filter(
    (o) =>
      o.deliveryDate &&
      o.expectedDelivery &&
      o.deliveryDate <= o.expectedDelivery,
  ).length;
  const deliveryRate =
    orders.length > 0 ? (onTimeDeliveries / orders.length) * 100 : 0;

  const averageReviewRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    totalProducts,
    lowStockRate:
      totalProducts > 0 ? (lowStockProducts / totalProducts) * 100 : 0,
    averageProductRating,
    totalRevenue,
    recentOrders: orders.length,
    onTimeDeliveryRate: deliveryRate,
    averageReviewRating,
    reliabilityScore:
      deliveryRate * 0.4 +
      averageProductRating * 0.3 +
      (totalProducts > 0
        ? (100 - (lowStockProducts / totalProducts) * 100) * 0.3
        : 0),
  };
}
