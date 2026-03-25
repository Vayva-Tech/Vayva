import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const PurchaseOrderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["draft", "pending", "approved", "ordered", "received", "cancelled"]).optional(),
  supplierId: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

const PurchaseOrderCreateSchema = z.object({
  supplierId: z.string(),
  orderDate: z.string().datetime().optional(),
  expectedDeliveryDate: z.string().datetime().optional(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    expectedDeliveryDate: z.string().datetime().optional(),
  })),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = PurchaseOrderQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        supplierId: searchParams.get("supplierId"),
        minAmount: searchParams.get("minAmount"),
        maxAmount: searchParams.get("maxAmount"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.supplierId && { supplierId: parseResult.supplierId }),
        ...(parseResult.minAmount !== undefined && { 
          totalAmount: { gte: parseResult.minAmount } 
        }),
        ...(parseResult.maxAmount !== undefined && { 
          totalAmount: { lte: parseResult.maxAmount } 
        }),
        ...(parseResult.dateFrom && { 
          createdAt: { gte: new Date(parseResult.dateFrom) } 
        }),
        ...(parseResult.dateTo && { 
          createdAt: { lte: new Date(parseResult.dateTo) } 
        }),
      };

      const [purchaseOrders, total] = await Promise.all([
        prisma.wholesalePurchaseOrder.findMany({
          where: whereClause,
          include: {
            supplier: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
              },
            },
            items: {
              select: {
                id: true,
                productId: true,
                quantity: true,
                receivedQuantity: true,
                unitPrice: true,
                totalPrice: true,
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.wholesalePurchaseOrder.count({ where: whereClause }),
      ]);

      return NextResponse.json(
        {
          data: purchaseOrders,
          meta: {
            page: parseResult.page,
            limit: parseResult.limit,
            total,
            totalPages: Math.ceil(total / parseResult.limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_PURCHASE_ORDERS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch purchase orders" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.WHOLESALE_MANAGE,
  async (req: NextRequest, { storeId, _user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = PurchaseOrderCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid purchase order data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify supplier exists
      const supplier = await prisma.wholesaleSupplier.findFirst({
        where: { id: parseResult.data.supplierId, storeId },
      });

      if (!supplier) {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify products exist
      const productIds = parseResult.data.items.map(item => item.productId);
      const products = await prisma.wholesaleProduct.findMany({
        where: {
          id: { in: productIds },
          storeId,
        },
      });

      if (products.length !== productIds.length) {
        return NextResponse.json(
          { error: "One or more products not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Calculate purchase order totals
      const itemsWithTotals = parseResult.data.items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      }));

      const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + taxAmount;

      // Generate PO number
      const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const createdPurchaseOrder = await prisma.wholesalePurchaseOrder.create({
        data: {
          storeId,
          poNumber,
          supplierId: parseResult.data.supplierId,
          orderDate: parseResult.data.orderDate ? new Date(parseResult.data.orderDate) : new Date(),
          expectedDeliveryDate: parseResult.data.expectedDeliveryDate 
            ? new Date(parseResult.data.expectedDeliveryDate) 
            : undefined,
          shippingAddress: JSON.stringify(parseResult.data.shippingAddress),
          billingAddress: parseResult.data.billingAddress 
            ? JSON.stringify(parseResult.data.billingAddress)
            : JSON.stringify(parseResult.data.shippingAddress),
          subtotal,
          taxAmount,
          totalAmount,
          status: "pending",
          notes: parseResult.data.notes,
          terms: parseResult.data.terms,
          items: {
            create: itemsWithTotals.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              receivedQuantity: 0,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              expectedDeliveryDate: item.expectedDeliveryDate 
                ? new Date(item.expectedDeliveryDate) 
                : undefined,
            })),
          },
        },
        include: {
          supplier: {
            select: {
              companyName: true,
            },
          },
          items: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            },
          },
        },
      });

      logger.info("[WHOLESALE_PURCHASE_ORDER_CREATE]", {
        poId: createdPurchaseOrder.id,
        poNumber: createdPurchaseOrder.poNumber,
        supplierId: parseResult.data.supplierId,
        totalAmount: createdPurchaseOrder.totalAmount,
        itemCount: itemsWithTotals.length,
      });

      return NextResponse.json(
        { data: createdPurchaseOrder },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_PURCHASE_ORDER_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create purchase order" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);