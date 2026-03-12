import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const GrantQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["draft", "submitted", "under_review", "funded", "rejected", "closed"]).optional(),
  funder: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  deadlineFrom: z.string().datetime().optional(),
  deadlineTo: z.string().datetime().optional(),
});

const GrantCreateSchema = z.object({
  title: z.string().min(1),
  funder: z.string().min(1),
  description: z.string().min(1),
  requestedAmount: z.number().positive(),
  duration: z.number().positive(), // in months
  deadline: z.string().datetime(),
  website: z.string().url().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  eligibilityRequirements: z.array(z.string()).default([]),
  requiredDocuments: z.array(z.string()).default([]),
  evaluationCriteria: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.GRANTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = GrantQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, status, funder, minAmount, maxAmount, deadlineFrom, deadlineTo } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (funder) where.funder = { contains: funder, mode: "insensitive" };
      if (minAmount !== undefined) where.requestedAmount = { ...where.requestedAmount, gte: minAmount };
      if (maxAmount !== undefined) where.requestedAmount = { ...where.requestedAmount, lte: maxAmount };
      if (deadlineFrom || deadlineTo) {
        where.deadline = {};
        if (deadlineFrom) where.deadline.gte = new Date(deadlineFrom);
        if (deadlineTo) where.deadline.lte = new Date(deadlineTo);
      }

      const [grants, total] = await Promise.all([
        prisma.nonprofitGrant.findMany({
          where,
          include: {
            applications: {
              select: {
                id: true,
                status: true,
                submittedAt: true,
                awardedAmount: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.nonprofitGrant.count({ where }),
      ]);

      // Calculate derived fields
      const grantsWithMetrics = grants.map(grant => {
        const applicationStats = grant.applications.reduce((acc, app) => {
          acc.total++;
          if (app.status === "awarded") {
            acc.awarded++;
            acc.totalAwarded += app.awardedAmount || 0;
          }
          return acc;
        }, { total: 0, awarded: 0, totalAwarded: 0 });

        return {
          ...grant,
          applicationCount: applicationStats.total,
          awardedApplications: applicationStats.awarded,
          totalAwarded: applicationStats.totalAwarded,
          successRate: applicationStats.total > 0 
            ? Math.round((applicationStats.awarded / applicationStats.total) * 10000) / 100
            : 0,
          daysUntilDeadline: Math.ceil((grant.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        };
      });

      return NextResponse.json(
        {
          data: grantsWithMetrics,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_GRANTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch grants" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.GRANTS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = GrantCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid grant data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      const grant = await prisma.nonprofitGrant.create({
        data: {
          storeId,
          title: body.title,
          funder: body.funder,
          description: body.description,
          requestedAmount: body.requestedAmount,
          duration: body.duration,
          deadline: new Date(body.deadline),
          website: body.website,
          contactName: body.contactName,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          eligibilityRequirements: JSON.stringify(body.eligibilityRequirements),
          requiredDocuments: JSON.stringify(body.requiredDocuments),
          evaluationCriteria: JSON.stringify(body.evaluationCriteria),
          notes: body.notes,
          status: "draft",
        },
      });

      return NextResponse.json(grant, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_GRANTS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create grant" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);