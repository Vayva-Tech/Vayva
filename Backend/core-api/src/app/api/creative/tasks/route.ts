import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const TaskQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["todo", "in_progress", "review", "completed", "blocked"]).optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  search: z.string().optional(),
});

const TaskCreateSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime(),
  estimatedHours: z.number().positive(),
  rate: z.number().nonnegative().default(0),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  tags: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.CREATIVE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = TaskQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        assigneeId: searchParams.get("assigneeId"),
        projectId: searchParams.get("projectId"),
        priority: searchParams.get("priority"),
        dueDateFrom: searchParams.get("dueDateFrom"),
        dueDateTo: searchParams.get("dueDateTo"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.assigneeId && { assigneeId: parseResult.assigneeId }),
        ...(parseResult.projectId && { projectId: parseResult.projectId }),
        ...(parseResult.priority && { priority: parseResult.priority }),
        ...(parseResult.dueDateFrom && { 
          dueDate: { gte: new Date(parseResult.dueDateFrom) } 
        }),
        ...(parseResult.dueDateTo && { 
          dueDate: { lte: new Date(parseResult.dueDateTo) } 
        }),
        ...(parseResult.search && {
          OR: [
            { name: { contains: parseResult.search, mode: "insensitive" } },
            { description: { contains: parseResult.search, mode: "insensitive" } },
            { tags: { has: parseResult.search } },
          ],
        }),
      };

      const [tasks, total] = await Promise.all([
        prisma.creativeTask.findMany({
          where: whereClause,
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                timesheets: true,
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: [
            { priority: "desc" },
            { dueDate: "asc" },
          ],
        }),
        prisma.creativeTask.count({ where: whereClause }),
      ]);

      // Calculate task metrics
      const tasksWithMetrics = await Promise.all(
        tasks.map(async (task) => {
          const totalTimeLogged = await prisma.creativeTimesheet.aggregate({
            where: { taskId: task.id },
            _sum: { hours: true },
          });

          const timeLogged = totalTimeLogged._sum.hours || 0;
          const progress = task.estimatedHours > 0 
            ? Math.min((timeLogged / task.estimatedHours) * 100, 100)
            : 0;

          return {
            ...task,
            metrics: {
              timeLogged,
              estimatedHours: task.estimatedHours,
              progress: Math.round(progress),
              timesheetCount: task._count.timesheets,
              isOverBudget: timeLogged > task.estimatedHours,
            },
          };
        })
      );

      return NextResponse.json(
        {
          data: tasksWithMetrics,
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
      logger.error("[CREATIVE_TASKS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
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
      const parseResult = TaskCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid task data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify project exists
      const project = await prisma.creativeProject.findFirst({
        where: { id: parseResult.data.projectId, storeId },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify assignee exists (if provided)
      if (parseResult.data.assigneeId) {
        const assignee = await prisma.user.findFirst({
          where: { id: parseResult.data.assigneeId },
        });

        if (!assignee) {
          return NextResponse.json(
            { error: "Assignee not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }
      }

      const createdTask = await prisma.creativeTask.create({
        data: {
          ...parseResult.data,
          storeId,
          status: "todo",
          tags: JSON.stringify(parseResult.data.tags),
          dependencies: JSON.stringify(parseResult.data.dependencies),
        },
        include: {
          project: {
            select: {
              name: true,
            },
          },
          assignee: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      logger.info("[CREATIVE_TASK_CREATE]", {
        taskId: createdTask.id,
        name: createdTask.name,
        projectId: parseResult.data.projectId,
        assigneeId: parseResult.data.assigneeId,
      });

      return NextResponse.json(
        { data: createdTask },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_TASK_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);