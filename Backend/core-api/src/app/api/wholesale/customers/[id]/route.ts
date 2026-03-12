import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const CustomerUpdateSchema = z.object({
  companyName: z.string().min(1).optional(),
  contactName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(1).optional(),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  creditLimit: z.number().nonnegative().optional(),
  paymentTerms: z.number().int().positive().optional(),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
  active: z.boolean().optional(),
  notes: z.string().optional(),
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

    const customer = await prisma.wholesaleCustomer.findFirst({
      where: { id, storeId },
      include: {
        orders: {
          where: { status: { not: "cancelled" } },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            orders: {
              where: { status: { not: "cancelled" } },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate customer metrics
    const totalOrders = customer._count.orders;
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    const customerWithMetrics = {
      ...customer,
      metrics: {
        totalOrders,
        totalSpent,
        averageOrderValue,
        outstandingBalance: customer.outstandingBalance,
        creditUtilization: customer.creditLimit > 0 
          ? (customer.outstandingBalance / customer.creditLimit) * 100
          : 0,
      },
    };

    return NextResponse.json(
      { data: customerWithMetrics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WHOLESALE_CUSTOMER_GET]", { error, customerId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const json = await req.json().catch(() => ({}));
    const parseResult = CustomerUpdateSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid customer data",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const updatedCustomer = await prisma.wholesaleCustomer.update({
      where: { id_storeId: { id, storeId } },
      data: {
        ...parseResult.data,
        billingAddress: parseResult.data.billingAddress 
          ? JSON.stringify(parseResult.data.billingAddress) 
          : undefined,
        shippingAddress: parseResult.data.shippingAddress 
          ? JSON.stringify(parseResult.data.shippingAddress) 
          : undefined,
      },
    });

    logger.info("[WHOLESALE_CUSTOMER_UPDATE]", {
      customerId: id,
      updatedFields: Object.keys(parseResult.data),
    });

    return NextResponse.json(
      { data: updatedCustomer },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WHOLESALE_CUSTOMER_UPDATE]", { error, customerId: params.id });
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Check if customer has active orders
    const activeOrders = await prisma.wholesaleOrder.count({
      where: {
        customerId: id,
        status: { in: ["pending", "processing", "shipped"] },
      },
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: "Cannot delete customer with active orders" },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    await prisma.wholesaleCustomer.delete({
      where: { id_storeId: { id, storeId } },
    });

    logger.info("[WHOLESALE_CUSTOMER_DELETE]", { customerId: id });

    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WHOLESALE_CUSTOMER_DELETE]", { error, customerId: params.id });
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}