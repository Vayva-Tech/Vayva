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
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

const InvoiceCreateSchema = z.object({
  clientId: z.string(),
  projectId: z.string().optional(),
  invoiceDate: z.string().datetime().optional(),
  dueDate: z.string().datetime(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
    taskId: z.string().optional(),
    timesheetId: z.string().optional(),
  })),
  discount: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative().default(0.08),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.CREATIVE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = InvoiceQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        clientId: searchParams.get("clientId"),
        projectId: searchParams.get("projectId"),
        minAmount: searchParams.get("minAmount"),
        maxAmount: searchParams.get("maxAmount"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.clientId && { clientId: parseResult.clientId }),
        ...(parseResult.projectId && { projectId: parseResult.projectId }),
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
      };

      const [invoices, total] = await Promise.all([
        prisma.creativeInvoice.findMany({
          where: whereClause,
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
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
        prisma.creativeInvoice.count({ where: whereClause }),
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
      logger.error("[CREATIVE_INVOICES_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch invoices" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.CREATIVE_MANAGE,
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

      // Verify client exists
      const client = await prisma.creativeClient.findFirst({
        where: { id: parseResult.data.clientId, storeId },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify project exists (if provided)
      let project = null;
      if (parseResult.data.projectId) {
        project = await prisma.creativeProject.findFirst({
          where: { 
            id: parseResult.data.projectId, 
            storeId,
            clientId: parseResult.data.clientId,
          },
        });

        if (!project) {
          return NextResponse.json(
            { error: "Project not found or doesn't belong to client" },
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
      const discountAmount = subtotal * (parseResult.data.discount / 100);
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * parseResult.data.taxRate;
      const totalAmount = taxableAmount + taxAmount;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const createdInvoice = await prisma.creativeInvoice.create({
        data: {
          storeId,
          invoiceNumber,
          clientId: parseResult.data.clientId,
          projectId: parseResult.data.projectId,
          invoiceDate: parseResult.data.invoiceDate ? new Date(parseResult.data.invoiceDate) : new Date(),
          dueDate: new Date(parseResult.data.dueDate),
          subtotal,
          discount: parseResult.data.discount,
          discountAmount,
          taxRate: parseResult.data.taxRate,
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
              taskId: item.taskId,
              timesheetId: item.timesheetId,
            })),
          },
        },
        include: {
          client: {
            select: {
              companyName: true,
            },
          },
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      logger.info("[CREATIVE_INVOICE_CREATE]", {
        invoiceId: createdInvoice.id,
        invoiceNumber: createdInvoice.invoiceNumber,
        clientId: parseResult.data.clientId,
        totalAmount: createdInvoice.totalAmount,
        itemCount: itemsWithTotals.length,
      });

      return NextResponse.json(
        { data: createdInvoice },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_INVOICE_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);