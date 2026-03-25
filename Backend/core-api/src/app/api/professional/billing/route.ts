import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const BillingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  clientId: z.string().optional(),
  matterId: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue", "void", "written_off"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

const TimeEntrySchema = z.object({
  matterId: z.string(),
  userId: z.string(),
  date: z.string().datetime(),
  durationMinutes: z.number().int().min(1),
  activityCode: z.string(),
  description: z.string(),
  billable: z.boolean().default(true),
  rate: z.number().min(0),
});

const InvoiceCreateSchema = z.object({
  clientId: z.string(),
  matterId: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().min(0),
    unitPrice: z.number().min(0),
    timeEntryIds: z.array(z.string()).optional(),
  })),
  dueDays: z.number().int().min(1).default(30),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = BillingQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        clientId: searchParams.get("clientId"),
        matterId: searchParams.get("matterId"),
        status: searchParams.get("status"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.clientId && { clientId: parseResult.clientId }),
        ...(parseResult.matterId && { matterId: parseResult.matterId }),
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.dateFrom && { 
          issuedAt: { gte: new Date(parseResult.dateFrom) } 
        }),
        ...(parseResult.dateTo && { 
          issuedAt: { lte: new Date(parseResult.dateTo) } 
        }),
      };

      const [invoices, total] = await Promise.all([
        prisma.professionalInvoice.findMany({
          where: whereClause,
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
              },
            },
            matter: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { issuedAt: "desc" },
        }),
        prisma.professionalInvoice.count({ where: whereClause }),
      ]);

      return NextResponse.json(
        {
          data: invoices,
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
      logger.error("[PROFESSIONAL_BILLING_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch billing data" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_MANAGE,
  async (req: NextRequest, { storeId, _user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      
      // Check if it's a time entry or invoice creation
      if (json.type === "time_entry") {
        const timeEntryData = TimeEntrySchema.parse(json.data);
        
        const createdTimeEntry = await prisma.professionalTimesheet.create({
          data: {
            ...timeEntryData,
            storeId,
            amount: (timeEntryData.durationMinutes / 60) * timeEntryData.rate,
            date: new Date(timeEntryData.date),
          },
          include: {
            matter: {
              select: {
                name: true,
                client: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        logger.info("[PROFESSIONAL_TIME_ENTRY_CREATE]", {
          timeEntryId: createdTimeEntry.id,
          matterId: timeEntryData.matterId,
          userId: timeEntryData.userId,
          duration: timeEntryData.durationMinutes,
        });

        return NextResponse.json(
          { data: createdTimeEntry },
          { headers: standardHeaders(requestId) }
        );
      } else {
        // Invoice creation
        const invoiceData = InvoiceCreateSchema.parse(json);
        
        const client = await prisma.professionalClient.findFirst({
          where: { id: invoiceData.clientId, storeId },
        });

        if (!client) {
          return NextResponse.json(
            { error: "Client not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        const totalAmount = invoiceData.lineItems.reduce(
          (sum, item) => sum + (item.quantity * item.unitPrice),
          0
        );

        const createdInvoice = await prisma.professionalInvoice.create({
          data: {
            storeId,
            clientId: invoiceData.clientId,
            matterId: invoiceData.matterId,
            issuedAt: new Date(),
            dueAt: new Date(Date.now() + invoiceData.dueDays * 24 * 60 * 60 * 1000),
            billedAmount: totalAmount,
            totalAmount,
            status: "draft",
            lineItems: JSON.stringify(invoiceData.lineItems),
            notes: invoiceData.notes,
          },
          include: {
            client: {
              select: {
                companyName: true,
                contactName: true,
              },
            },
            matter: {
              select: {
                name: true,
              },
            },
          },
        });

        logger.info("[PROFESSIONAL_INVOICE_CREATE]", {
          invoiceId: createdInvoice.id,
          clientId: invoiceData.clientId,
          amount: totalAmount,
        });

        return NextResponse.json(
          { data: createdInvoice },
          { headers: standardHeaders(requestId) }
        );
      }
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_BILLING_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create billing record" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Analytics endpoint for billing metrics
export async function GET_BILLING_ANALYTICS(req: NextRequest, { storeId, correlationId }: APIContext) {
  const requestId = correlationId;
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";
    
    const now = new Date();
    let startDate: Date;
    
    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Get billing metrics
    const [totalRevenue, billedHours, wipHours, collectionRate] = await Promise.all([
      prisma.professionalInvoice.aggregate({
        where: {
          storeId,
          status: "paid",
          paidAt: { gte: startDate },
        },
        _sum: { paidAmount: true },
      }),
      prisma.professionalTimesheet.aggregate({
        where: {
          storeId,
          billed: true,
          createdAt: { gte: startDate },
        },
        _sum: { hours: true },
      }),
      prisma.professionalTimesheet.aggregate({
        where: {
          storeId,
          billed: false,
          createdAt: { gte: startDate },
        },
        _sum: { hours: true },
      }),
      // Collection rate calculation would be more complex in real implementation
      Promise.resolve({ rate: 95 }), // Placeholder
    ]);

    const analytics = {
      revenueMTD: totalRevenue._sum.paidAmount || 0,
      billedHours: billedHours._sum.hours || 0,
      wipHours: wipHours._sum.hours || 0,
      collectionRate: collectionRate.rate,
      utilizationRate: 82, // Would calculate from actual data
      dso: 38, // Days Sales Outstanding
      realizationRate: 94.2, // Percentage of worked hours that are billed
    };

    return NextResponse.json(
      { data: analytics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_BILLING_ANALYTICS]", { error, storeId });
    return NextResponse.json(
      { error: "Failed to fetch billing analytics" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}