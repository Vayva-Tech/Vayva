import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ApplicationCreateSchema = z.object({
  grantId: z.string(),
  projectName: z.string().min(1),
  projectDescription: z.string().min(1),
  requestedAmount: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  teamMembers: z.array(z.object({
    name: z.string(),
    role: z.string(),
    qualifications: z.string().optional(),
  })).default([]),
  budgetBreakdown: z.array(z.object({
    category: z.string(),
    amount: z.number().nonnegative(),
    description: z.string().optional(),
  })).default([]),
  expectedOutcomes: z.array(z.string()).default([]),
  sustainabilityPlan: z.string().optional(),
  supportingDocuments: z.array(z.string()).default([]), // URLs or file paths
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.GRANTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status');
      const grantId = searchParams.get('grantId');
      
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      if (status) where.status = status;
      if (grantId) where.grantId = grantId;

      const [applications, total] = await Promise.all([
        prisma.nonprofitGrantApplication.findMany({
          where,
          include: {
            grant: {
              select: {
                title: true,
                funder: true,
                requestedAmount: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.nonprofitGrantApplication.count({ where }),
      ]);

      // Calculate application metrics
      const applicationsWithMetrics = applications.map(app => ({
        ...app,
        teamMembers: JSON.parse(app.teamMembers || "[]"),
        budgetBreakdown: JSON.parse(app.budgetBreakdown || "[]"),
        expectedOutcomes: JSON.parse(app.expectedOutcomes || "[]"),
        supportingDocuments: JSON.parse(app.supportingDocuments || "[]"),
        totalBudget: JSON.parse(app.budgetBreakdown || "[]").reduce((sum: number, item: any) => sum + item.amount, 0),
        daysSinceSubmission: Math.floor((Date.now() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24)),
      }));

      return NextResponse.json(
        {
          data: applicationsWithMetrics,
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
      logger.error("[NONPROFIT_GRANT_APPLICATIONS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch grant applications" },
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
      const parseResult = ApplicationCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid application data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify grant exists
      const grant = await prisma.nonprofitGrant.findFirst({
        where: { id: body.grantId, storeId },
      });

      if (!grant) {
        return NextResponse.json(
          { error: "Grant not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Check if deadline has passed
      if (grant.deadline < new Date()) {
        return NextResponse.json(
          { error: "Grant deadline has passed" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const application = await prisma.nonprofitGrantApplication.create({
        data: {
          storeId,
          grantId: body.grantId,
          projectName: body.projectName,
          projectDescription: body.projectDescription,
          requestedAmount: body.requestedAmount,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          teamMembers: JSON.stringify(body.teamMembers),
          budgetBreakdown: JSON.stringify(body.budgetBreakdown),
          expectedOutcomes: JSON.stringify(body.expectedOutcomes),
          sustainabilityPlan: body.sustainabilityPlan,
          supportingDocuments: JSON.stringify(body.supportingDocuments),
          notes: body.notes,
          status: "draft",
        },
        include: {
          grant: {
            select: {
              title: true,
              funder: true,
            },
          },
        },
      });

      return NextResponse.json(application, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_GRANT_APPLICATIONS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create grant application" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);