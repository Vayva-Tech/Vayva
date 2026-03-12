import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const OrderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "returned"]).optional(),
  customerId: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  fulfillmentMethod: z.enum(["delivery", "pickup", "curbside"]).optional(),
});

const OrderCreateSchema = z.object({
  customerId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    notes: z.string().optional(),
  })),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default("US"),
    instructions: z.string().optional(),
  }).optional(),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default("US"),
  }).optional(),
  fulfillmentMethod: z.enum(["delivery", "pickup", "curbside"]).default("delivery"),
  deliveryDate: z.string().datetime().optional(),
  deliveryTimeSlot: z.string().optional(),
  paymentMethod: z.enum(["credit_card", "debit_card", "cash", "check", "mobile_pay"]),
  specialInstructions: z.string().optional(),
  promoCode: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = OrderQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, status, customerId, minAmount, maxAmount, dateFrom, dateTo, fulfillmentMethod } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (fulfillmentMethod) where.fulfillmentMethod = fulfillmentMethod;
      if (minAmount !== undefined) where.totalAmount = { gte: minAmount };
      if (maxAmount !== undefined) where.totalAmount = { lte: maxAmount };
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [orders, total] = await Promise.all([
        prisma.groceryOrder.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            items: {
              select: {
                id: true,
                productId: true,
                quantity: true,
                unitPrice: true,
                product: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.groceryOrder.count({ where }),
      ]);

      // Calculate order metrics
      const ordersWithMetrics = orders.map(order => {
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const daysSinceOrder = Math.floor((Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        const isOverdue = order.deliveryDate && new Date(order.deliveryDate) < new Date() && 
                         !['delivered', 'cancelled'].includes(order.status);

        return {
          ...order,
          shippingAddress: JSON.parse(order.shippingAddress || "{}"),
          billingAddress: JSON.parse(order.billingAddress || "{}"),
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
          itemCount,
          daysSinceOrder,
          isOverdue,
          isHighValue: order.totalAmount > 100,
          requiresAttention: isOverdue || order.status === "pending",
        };
      });

      return NextResponse.json(
        {
          data: ordersWithMetrics,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_ORDERS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
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

      const body = parseResult.data;

      // Verify customer exists
      const customer = await prisma.user.findFirst({
        where: { id: body.customerId, storeId },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Validate items and calculate totals
      let subtotal = 0;
      const validatedItems = [];

      for (const item of body.items) {
        const product = await prisma.groceryProduct.findFirst({
          where: { id: item.productId, storeId },
        });

        if (!product) {
          return NextResponse.json(
            { error: `Product ${item.productId} not found` },
            { status: 404, headers: standardHeaders(requestId) }
          );
        }

        if (product.currentStock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}` },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;
        
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes,
          total: itemTotal,
        });
      }

      // Apply promo code if provided
      let discount = 0;
      if (body.promoCode) {
        const promo = await prisma.groceryPromotion.findFirst({
          where: { 
            code: body.promoCode,
            storeId,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            status: "active",
          },
        });

        if (promo) {
          discount = promo.discountType === "percentage" 
            ? subtotal * (promo.discountValue / 100)
            : Math.min(promo.discountValue, subtotal);
        }
      }

      const totalAmount = subtotal - discount;
      const taxAmount = totalAmount * 0.08; // 8% tax
      const finalTotal = totalAmount + taxAmount;

      // Create order
      const order = await prisma.groceryOrder.create({
        data: {
          storeId,
          customerId: body.customerId,
          subtotal,
          discount,
          taxAmount,
          totalAmount: finalTotal,
          shippingAddress: body.shippingAddress ? JSON.stringify(body.shippingAddress) : null,
          billingAddress: body.billingAddress ? JSON.stringify(body.billingAddress) : null,
          fulfillmentMethod: body.fulfillmentMethod,
          deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
          deliveryTimeSlot: body.deliveryTimeSlot,
          paymentMethod: body.paymentMethod,
          specialInstructions: body.specialInstructions,
          promoCode: body.promoCode,
          status: "pending",
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Create order items
      await Promise.all(
        validatedItems.map(item => 
          prisma.groceryOrderItem.create({
            data: {
              storeId,
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              notes: item.notes,
            },
          })
        )
      );

      // Update product stock
      await Promise.all(
        validatedItems.map(item => 
          prisma.groceryProduct.update({
            where: { id: item.productId },
            data: {
              currentStock: { decrement: item.quantity },
            },
          })
        )
      );

      return NextResponse.json(order, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[GROCERY_ORDERS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);