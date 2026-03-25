import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const MatterQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["open", "in_progress", "on_hold", "closed", "completed"]).optional(),
  caseId: z.string().optional(),
  assignedToId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  search: z.string().optional(),
});

const MatterCreateSchema = z.object({
  caseId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  assignedToId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime(),
  estimatedHours: z.number().positive().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.LEGAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = MatterQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        caseId: searchParams.get("caseId"),
        assignedToId: searchParams.get("assignedToId"),
        priority: searchParams.get("priority"),
        dueDateFrom: searchParams.get("dueDateFrom"),
        dueDateTo: searchParams.get("dueDateTo"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.caseId && { caseId: parseResult.caseId }),
        ...(parseResult.assignedToId && { assignedToId: parseResult.assignedToId }),
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

      const [matters, total] = await Promise.all([
        prisma.legalMatter.findMany({
          where: whereClause,
          include: {
            case: {
              select: {
                id: true,
                name: true,
                caseNumber: true,
                client: {
                  select: {
                    id: true,
                    companyName: true,
                  },
                },
              },
            },
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                dockets: true,
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
        prisma.legalMatter.count({ where: whereClause }),
      ]);

      // Calculate matter metrics
      const mattersWithMetrics = await Promise.all(
        matters.map(async (matter) => {
          const totalTimeLogged = await prisma.legalTimesheet.aggregate({
            where: { matterId: matter.id },
            _sum: { hours: true },
          });

          const timeLogged = totalTimeLogged._sum.hours || 0;
          const progress = matter.estimatedHours && matter.estimatedHours > 0 
            ? Math.min((timeLogged / matter.estimatedHours) * 100, 100)
            : 0;

          return {
            ...matter,
            metrics: {
              timeLogged,
              estimatedHours: matter.estimatedHours || 0,
              progress: Math.round(progress),
              docketCount: matter._count.dockets,
              timesheetCount: matter._count.timesheets,
              daysUntilDue: Math.ceil((new Date(matter.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            },
          };
        })
      );

      return NextResponse.json(
        {
          data: mattersWithMetrics,
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
      logger.error("[LEGAL_MATTERS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch matters" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.LEGAL_MANAGE,
  async (req: NextRequest, { storeId, _user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = MatterCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid matter data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify case exists
      const caseItem = await prisma.legalCase.findFirst({
        where: { id: parseResult.data.caseId, storeId },
      });

      if (!caseItem) {
        return NextResponse.json(
          { error: "Case not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify assignee exists (if provided)
      if (parseResult.data.assignedToId) {
        const assignee = await prisma.user.findFirst({
          where: { id: parseResult.data.assignedToId },
        });

        if (!assignee) {
          return NextResponse.json(
            { error: "Assignee not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }
      }

      const createdMatter = await prisma.legalMatter.create({
        data: {
          ...parseResult.data,
          storeId,
          status: "open",
          tags: JSON.stringify(parseResult.data.tags),
          startDate: parseResult.data.startDate ? new Date(parseResult.data.startDate) : new Date(),
        },
        include: {
          case: {
            select: {
              name: true,
              caseNumber: true,
              client: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          assignedTo: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      logger.info("[LEGAL_MATTER_CREATE]", {
        matterId: createdMatter.id,
        name: createdMatter.name,
        caseId: parseResult.data.caseId,
        assignedToId: parseResult.data.assignedToId,
      });

      return NextResponse.json(
        { data: createdMatter },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[LEGAL_MATTER_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create matter" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);