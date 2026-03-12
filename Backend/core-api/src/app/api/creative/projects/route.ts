import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ProjectQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["draft", "planning", "active", "on_hold", "completed", "cancelled"]).optional(),
  clientId: z.string().optional(),
  categoryId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  search: z.string().optional(),
});

const ProjectCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  clientId: z.string(),
  categoryId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  budget: z.number().nonnegative().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  projectManagerId: z.string().optional(),
  teamMembers: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  objectives: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.CREATIVE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = ProjectQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        clientId: searchParams.get("clientId"),
        categoryId: searchParams.get("categoryId"),
        priority: searchParams.get("priority"),
        minBudget: searchParams.get("minBudget"),
        maxBudget: searchParams.get("maxBudget"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.clientId && { clientId: parseResult.clientId }),
        ...(parseResult.categoryId && { categoryId: parseResult.categoryId }),
        ...(parseResult.priority && { priority: parseResult.priority }),
        ...(parseResult.minBudget !== undefined && { 
          budget: { gte: parseResult.minBudget } 
        }),
        ...(parseResult.maxBudget !== undefined && { 
          budget: { lte: parseResult.maxBudget } 
        }),
        ...(parseResult.search && {
          OR: [
            { name: { contains: parseResult.search, mode: "insensitive" } },
            { description: { contains: parseResult.search, mode: "insensitive" } },
            { tags: { has: parseResult.search } },
          ],
        }),
      };

      const [projects, total] = await Promise.all([
        prisma.creativeProject.findMany({
          where: whereClause,
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            projectManager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                tasks: true,
                timesheets: true,
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.creativeProject.count({ where: whereClause }),
      ]);

      // Calculate project metrics
      const projectsWithMetrics = await Promise.all(
        projects.map(async (project) => {
          const totalTimeLogged = await prisma.creativeTimesheet.aggregate({
            where: { taskId: { in: project.tasks.map(t => t.id) } },
            _sum: { hours: true },
          });

          const totalTaskValue = project.tasks.reduce((sum, task) => sum + (task.rate * task.estimatedHours), 0);
          
          return {
            ...project,
            metrics: {
              totalTimeLogged: totalTimeLogged._sum.hours || 0,
              totalTasks: project._count.tasks,
              totalTimesheets: project._count.timesheets,
              estimatedValue: totalTaskValue,
              progress: project.status === "completed" ? 100 : 
                     project.status === "active" ? 75 :
                     project.status === "planning" ? 25 : 0,
            },
          };
        })
      );

      return NextResponse.json(
        {
          data: projectsWithMetrics,
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
      logger.error("[CREATIVE_PROJECTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.CREATIVE_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = ProjectCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid project data",
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

      // Verify category exists
      const category = await prisma.creativeCategory.findFirst({
        where: { id: parseResult.data.categoryId, storeId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const createdProject = await prisma.creativeProject.create({
        data: {
          ...parseResult.data,
          storeId,
          status: "draft",
          tags: JSON.stringify(parseResult.data.tags),
          objectives: JSON.stringify(parseResult.data.objectives),
          deliverables: JSON.stringify(parseResult.data.deliverables),
        },
        include: {
          client: {
            select: {
              companyName: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      logger.info("[CREATIVE_PROJECT_CREATE]", {
        projectId: createdProject.id,
        name: createdProject.name,
        clientId: parseResult.data.clientId,
      });

      return NextResponse.json(
        { data: createdProject },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_PROJECT_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);