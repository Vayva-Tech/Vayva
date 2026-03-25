import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const InvoiceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  customerId: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
});

const InvoiceCreateSchema = z.object({
  customerId: z.string(),
  invoiceDate: z.string().datetime().optional(),
  dueDate: z.string().datetime(),
  orderId: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    productId: z.string().optional(),
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
      
      const parseResult = InvoiceQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        customerId: searchParams.get("customerId"),
        minAmount: searchParams.get("minAmount"),
        maxAmount: searchParams.get("maxAmount"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
        dueDateFrom: searchParams.get("dueDateFrom"),
        dueDateTo: searchParams.get("dueDateTo"),
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
          invoiceDate: { gte: new Date(parseResult.dateFrom) } 
        }),
        ...(parseResult.dateTo && { 
          invoiceDate: { lte: new Date(parseResult.dateTo) } 
        }),
        ...(parseResult.dueDateFrom && { 
          dueDate: { gte: new Date(parseResult.dueDateFrom) } 
        }),
        ...(parseResult.dueDateTo && { 
          dueDate: { lte: new Date(parseResult.dueDateTo) } 
        }),
      };

      const [invoices, total] = await Promise.all([
        prisma.wholesaleInvoice.findMany({
          where: whereClause,
          include: {
            customer: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
              },
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
            payments: {
              select: {
                id: true,
                amount: true,
                paymentDate: true,
                status: true,
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { invoiceDate: "desc" },
        }),
        prisma.wholesaleInvoice.count({ where: whereClause }),
      ]);

      // Calculate payment status for each invoice
      const invoicesWithPaymentStatus = invoices.map(invoice => {
        const totalPayments = invoice.payments
          .filter(payment => payment.status === "completed")
          .reduce((sum, payment) => sum + payment.amount, 0);
        
        const balanceDue = invoice.totalAmount - totalPayments;
        const isOverdue = balanceDue > 0 && new Date() > invoice.dueDate;
        
        return {
          ...invoice,
          paymentStatus: {
            totalPayments,
            balanceDue,
            isOverdue,
            paidInFull: balanceDue <= 0,
          },
        };
      });

      return NextResponse.json(
        {
          data: invoicesWithPaymentStatus,
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
      logger.error("[WHOLESALE_INVOICES_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch invoices" },
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
      const parseResult = InvoiceCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid invoice data",
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

      // Verify order exists if provided
      let order = null;
      if (parseResult.data.orderId) {
        order = await prisma.wholesaleOrder.findFirst({
          where: { 
            id: parseResult.data.orderId, 
            storeId,
            customerId: parseResult.data.customerId,
          },
        });

        if (!order) {
          return NextResponse.json(
            { error: "Order not found or doesn't belong to customer" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }
      }

      // Calculate invoice totals
      const itemsWithTotals = parseResult.data.items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      }));

      const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + taxAmount;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const createdInvoice = await prisma.wholesaleInvoice.create({
        data: {
          storeId,
          invoiceNumber,
          customerId: parseResult.data.customerId,
          orderId: parseResult.data.orderId,
          invoiceDate: parseResult.data.invoiceDate ? new Date(parseResult.data.invoiceDate) : new Date(),
          dueDate: new Date(parseResult.data.dueDate),
          subtotal,
          taxAmount,
          totalAmount,
          status: "sent",
          notes: parseResult.data.notes,
          terms: parseResult.data.terms,
          items: {
            create: itemsWithTotals.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              productId: item.productId,
            })),
          },
        },
        include: {
          customer: {
            select: {
              companyName: true,
            },
          },
          order: {
            select: {
              orderNumber: true,
            },
          },
        },
      });

      logger.info("[WHOLESALE_INVOICE_CREATE]", {
        invoiceId: createdInvoice.id,
        invoiceNumber: createdInvoice.invoiceNumber,
        customerId: parseResult.data.customerId,
        totalAmount: createdInvoice.totalAmount,
        itemCount: itemsWithTotals.length,
      });

      return NextResponse.json(
        { data: createdInvoice },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_INVOICE_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);