import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const OrderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  customerId: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
});

const OrderCreateSchema = z.object({
  customerId: z.string(),
  orderDate: z.string().datetime().optional(),
  requiredDate: z.string().datetime().optional(),
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
  })),
  notes: z.string().optional(),
  poNumber: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = OrderQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        customerId: searchParams.get("customerId"),
        minAmount: searchParams.get("minAmount"),
        maxAmount: searchParams.get("maxAmount"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.customerId && { customerId: parseResult.customerId }),
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
        ...(parseResult.search && {
          OR: [
            { orderNumber: { contains: parseResult.search, mode: "insensitive" } },
            { poNumber: { contains: parseResult.search, mode: "insensitive" } },
            { notes: { contains: parseResult.search, mode: "insensitive" } },
          ],
        }),
      };

      const [orders, total] = await Promise.all([
        prisma.wholesaleOrder.findMany({
          where: whereClause,
          include: {
            customer: {
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
                unitPrice: true,
                totalPrice: true,
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.wholesaleOrder.count({ where: whereClause }),
      ]);

      return NextResponse.json(
        {
          data: orders,
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
      logger.error("[WHOLESALE_ORDERS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.WHOLESALE_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = OrderCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid order data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify customer exists
      const customer = await prisma.wholesaleCustomer.findFirst({
        where: { id: parseResult.data.customerId, storeId },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify products exist and calculate totals
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

      // Validate quantities against inventory
      const inventoryChecks = await Promise.all(
        parseResult.data.items.map(async (item) => {
          const inventory = await prisma.wholesaleInventory.findFirst({
            where: { productId: item.productId, storeId },
          });
          
          const availableStock = inventory ? inventory.currentStock - inventory.reservedStock : 0;
          return {
            productId: item.productId,
            hasSufficientStock: availableStock >= item.quantity,
            availableStock,
            requestedQuantity: item.quantity,
          };
        })
      );

      const insufficientStockItems = inventoryChecks.filter(check => !check.hasSufficientStock);
      if (insufficientStockItems.length > 0) {
        return NextResponse.json(
          { 
            error: "Insufficient inventory for some items",
            details: insufficientStockItems 
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Calculate order totals
      const itemsWithTotals = parseResult.data.items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      }));

      const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + taxAmount;

      // Generate order number
      const orderNumber = `WO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const createdOrder = await prisma.$transaction(async (tx) => {
        // Create the order
        const order = await tx.wholesaleOrder.create({
          data: {
            storeId,
            orderNumber,
            customerId: parseResult.data.customerId,
            orderDate: parseResult.data.orderDate ? new Date(parseResult.data.orderDate) : new Date(),
            requiredDate: parseResult.data.requiredDate ? new Date(parseResult.data.requiredDate) : undefined,
            shippingAddress: JSON.stringify(parseResult.data.shippingAddress),
            billingAddress: parseResult.data.billingAddress 
              ? JSON.stringify(parseResult.data.billingAddress)
              : JSON.stringify(parseResult.data.shippingAddress),
            subtotal,
            taxAmount,
            totalAmount,
            status: "pending",
            notes: parseResult.data.notes,
            poNumber: parseResult.data.poNumber,
          },
        });

        // Create order items
        await tx.wholesaleOrderItem.createMany({
          data: itemsWithTotals.map(item => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        });

        // Update inventory (reserve stock)
        for (const item of itemsWithTotals) {
          await tx.wholesaleInventory.updateMany({
            where: {
              productId: item.productId,
              storeId,
            },
            data: {
              reservedStock: {
                increment: item.quantity,
              },
            },
          });
        }

        // Update customer balance
        await tx.wholesaleCustomer.update({
          where: { id_storeId: { id: parseResult.data.customerId, storeId } },
          data: {
            outstandingBalance: {
              increment: totalAmount,
            },
          },
        });

        return order;
      });

      logger.info("[WHOLESALE_ORDER_CREATE]", {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        customerId: parseResult.data.customerId,
        totalAmount: createdOrder.totalAmount,
        itemCount: itemsWithTotals.length,
      });

      return NextResponse.json(
        { data: createdOrder },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_ORDER_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);