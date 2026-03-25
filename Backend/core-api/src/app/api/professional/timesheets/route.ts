import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const TimesheetQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  userId: z.string().optional(),
  caseId: z.string().optional(),
  matterId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

const TimesheetCreateSchema = z.object({
  userId: z.string(),
  caseId: z.string().optional(),
  matterId: z.string().optional(),
  date: z.string().datetime(),
  hours: z.number().positive().max(24),
  description: z.string().optional(),
  billable: z.boolean().default(true),
  hourlyRate: z.number().nonnegative().default(0),
  activityType: z.enum(["research", "meeting", "writing", "analysis", "court", "other"]).default("other"),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = TimesheetQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        userId: searchParams.get("userId"),
        caseId: searchParams.get("caseId"),
        matterId: searchParams.get("matterId"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.userId && { userId: parseResult.userId }),
        ...(parseResult.caseId && { caseId: parseResult.caseId }),
        ...(parseResult.matterId && { matterId: parseResult.matterId }),
        ...(parseResult.dateFrom && { 
          date: { gte: new Date(parseResult.dateFrom) } 
        }),
        ...(parseResult.dateTo && { 
          date: { lte: new Date(parseResult.dateTo) } 
        }),
      };

      const [timesheets, total] = await Promise.all([
        prisma.professionalTimesheet.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            case: {
              select: {
                id: true,
                name: true,
                client: {
                  select: {
                    id: true,
                    companyName: true,
                  },
                },
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
          orderBy: { date: "desc" },
        }),
        prisma.professionalTimesheet.count({ where: whereClause }),
      ]);

      // Calculate timesheet metrics
      const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
      const billableHours = timesheets
        .filter(ts => ts.billable)
        .reduce((sum, ts) => sum + ts.hours, 0);
      const totalValue = timesheets.reduce((sum, ts) => sum + (ts.hours * ts.hourlyRate), 0);

      const timesheetsWithMetrics = {
        data: timesheets,
        summary: {
          totalHours,
          billableHours,
          nonBillableHours: totalHours - billableHours,
          totalValue,
          averageHourlyRate: totalHours > 0 ? totalValue / totalHours : 0,
        },
        meta: {
          page: parseResult.page,
          limit: parseResult.limit,
          total,
          totalPages: Math.ceil(total / parseResult.limit),
        },
      };

      return NextResponse.json(
        timesheetsWithMetrics,
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_TIMESHEETS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch timesheets" },
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
      const parseResult = TimesheetCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid timesheet data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify user exists
      const timesheetUser = await prisma.user.findFirst({
        where: { id: parseResult.data.userId },
      });

      if (!timesheetUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify case exists (if provided)
      if (parseResult.data.caseId) {
        const caseItem = await prisma.professionalCase.findFirst({
          where: { id: parseResult.data.caseId, storeId },
        });

        if (!caseItem) {
          return NextResponse.json(
            { error: "Case not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }
      }

      // Verify matter exists (if provided)
      if (parseResult.data.matterId) {
        const matter = await prisma.professionalMatter.findFirst({
          where: { id: parseResult.data.matterId, storeId },
        });

        if (!matter) {
          return NextResponse.json(
            { error: "Matter not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }
      }

      const createdTimesheet = await prisma.professionalTimesheet.create({
        data: {
          ...parseResult.data,
          storeId,
          status: "draft",
          date: new Date(parseResult.data.date),
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          case: {
            select: {
              name: true,
              client: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          matter: {
            select: {
              name: true,
            },
          },
        },
      });

      logger.info("[PROFESSIONAL_TIMESHEET_CREATE]", {
        timesheetId: createdTimesheet.id,
        userId: parseResult.data.userId,
        hours: parseResult.data.hours,
        billable: parseResult.data.billable,
      });

      return NextResponse.json(
        { data: createdTimesheet },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_TIMESHEET_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create timesheet" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);