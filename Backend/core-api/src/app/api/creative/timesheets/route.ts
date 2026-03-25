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
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

const TimesheetCreateSchema = z.object({
  userId: z.string(),
  taskId: z.string(),
  date: z.string().datetime(),
  hours: z.number().positive().max(24),
  description: z.string().optional(),
  billable: z.boolean().default(true),
  hourlyRate: z.number().nonnegative().default(0),
});

export const GET = withVayvaAPI(
  PERMISSIONS.CREATIVE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = TimesheetQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        userId: searchParams.get("userId"),
        projectId: searchParams.get("projectId"),
        taskId: searchParams.get("taskId"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.userId && { userId: parseResult.userId }),
        ...(parseResult.taskId && { taskId: parseResult.taskId }),
        ...(parseResult.projectId && { 
          task: { projectId: parseResult.projectId } 
        }),
        ...(parseResult.dateFrom && { 
          date: { gte: new Date(parseResult.dateFrom) } 
        }),
        ...(parseResult.dateTo && { 
          date: { lte: new Date(parseResult.dateTo) } 
        }),
      };

      const [timesheets, total] = await Promise.all([
        prisma.creativeTimesheet.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            task: {
              select: {
                id: true,
                name: true,
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { date: "desc" },
        }),
        prisma.creativeTimesheet.count({ where: whereClause }),
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
      logger.error("[CREATIVE_TIMESHEETS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch timesheets" },
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

      // Verify task exists and belongs to store
      const task = await prisma.creativeTask.findFirst({
        where: { 
          id: parseResult.data.taskId,
          project: { storeId },
        },
        include: {
          project: {
            select: {
              id: true,
              clientId: true,
            },
          },
        },
      });

      if (!task) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const createdTimesheet = await prisma.creativeTimesheet.create({
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
          task: {
            select: {
              name: true,
              project: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      logger.info("[CREATIVE_TIMESHEET_CREATE]", {
        timesheetId: createdTimesheet.id,
        userId: parseResult.data.userId,
        taskId: parseResult.data.taskId,
        hours: parseResult.data.hours,
      });

      return NextResponse.json(
        { data: createdTimesheet },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_TIMESHEET_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create timesheet" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);