import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const CaseQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["open", "in_progress", "on_hold", "closed", "archived"]).optional(),
  clientId: z.string().optional(),
  practiceAreaId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedToId: z.string().optional(),
  search: z.string().optional(),
});

const CaseCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  clientId: z.string(),
  practiceAreaId: z.string(),
  assignedToId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  startDate: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional(),
  budget: z.number().nonnegative().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = CaseQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        clientId: searchParams.get("clientId"),
        practiceAreaId: searchParams.get("practiceAreaId"),
        priority: searchParams.get("priority"),
        assignedToId: searchParams.get("assignedToId"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.clientId && { clientId: parseResult.clientId }),
        ...(parseResult.practiceAreaId && { practiceAreaId: parseResult.practiceAreaId }),
        ...(parseResult.priority && { priority: parseResult.priority }),
        ...(parseResult.assignedToId && { assignedToId: parseResult.assignedToId }),
        ...(parseResult.search && {
          OR: [
            { name: { contains: parseResult.search, mode: "insensitive" } },
            { description: { contains: parseResult.search, mode: "insensitive" } },
            { tags: { has: parseResult.search } },
          ],
        }),
      };

      const [cases, total] = await Promise.all([
        prisma.professionalCase.findMany({
          where: whereClause,
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
              },
            },
            practiceArea: {
              select: {
                id: true,
                name: true,
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
                matters: true,
                documents: true,
                timesheets: true,
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.professionalCase.count({ where: whereClause }),
      ]);

      // Calculate case metrics
      const casesWithMetrics = await Promise.all(
        cases.map(async (caseItem) => {
          const totalTimeLogged = await prisma.professionalTimesheet.aggregate({
            where: { caseId: caseItem.id },
            _sum: { hours: true },
          });

          const totalBillableValue = await prisma.professionalTimesheet.aggregate({
            where: { caseId: caseItem.id, billable: true },
            _sum: { hours: true },
          });

          return {
            ...caseItem,
            metrics: {
              totalTimeLogged: totalTimeLogged._sum.hours || 0,
              totalBillableHours: totalBillableValue._sum.hours || 0,
              totalMatters: caseItem._count.matters,
              totalDocuments: caseItem._count.documents,
              totalTimesheets: caseItem._count.timesheets,
              progress: caseItem.status === "closed" ? 100 : 
                     caseItem.status === "in_progress" ? 75 :
                     caseItem.status === "open" ? 25 : 0,
            },
          };
        })
      );

      return NextResponse.json(
        {
          data: casesWithMetrics,
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
      logger.error("[PROFESSIONAL_CASES_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch cases" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = CaseCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid case data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify client exists
      const client = await prisma.professionalClient.findFirst({
        where: { id: parseResult.data.clientId, storeId },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify practice area exists
      const practiceArea = await prisma.professionalPracticeArea.findFirst({
        where: { id: parseResult.data.practiceAreaId, storeId },
      });

      if (!practiceArea) {
        return NextResponse.json(
          { error: "Practice area not found" },
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

      const createdCase = await prisma.professionalCase.create({
        data: {
          ...parseResult.data,
          storeId,
          status: "open",
          tags: JSON.stringify(parseResult.data.tags),
          startDate: parseResult.data.startDate ? new Date(parseResult.data.startDate) : new Date(),
        },
        include: {
          client: {
            select: {
              companyName: true,
            },
          },
          practiceArea: {
            select: {
              name: true,
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

      logger.info("[PROFESSIONAL_CASE_CREATE]", {
        caseId: createdCase.id,
        name: createdCase.name,
        clientId: parseResult.data.clientId,
        practiceAreaId: parseResult.data.practiceAreaId,
      });

      return NextResponse.json(
        { data: createdCase },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_CASE_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create case" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);