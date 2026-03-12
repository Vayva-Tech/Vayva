import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const OutcomeCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  beneficiaryType: z.string().min(1),
  targetBeneficiaries: z.number().int().positive(),
  reachedBeneficiaries: z.number().int().nonnegative().default(0),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  programId: z.string().optional(),
  location: z.string().optional(),
  demographicBreakdown: z.object({
    ageGroups: z.record(z.number()).optional(),
    gender: z.record(z.number()).optional(),
    ethnicity: z.record(z.number()).optional(),
  }).optional(),
  impactEvidence: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  lessonsLearned: z.string().optional(),
  sustainability: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.IMPACT_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const programId = searchParams.get('programId');
      const beneficiaryType = searchParams.get('beneficiaryType');
      
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      if (programId) where.programId = programId;
      if (beneficiaryType) where.beneficiaryType = beneficiaryType;

      const [outcomes, total] = await Promise.all([
        prisma.nonprofitOutcome.findMany({
          where,
          include: {
            program: {
              select: {
                name: true,
                description: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.nonprofitOutcome.count({ where }),
      ]);

      // Calculate outcome metrics
      const outcomesWithMetrics = outcomes.map(outcome => ({
        ...outcome,
        demographicBreakdown: JSON.parse(outcome.demographicBreakdown || "{}"),
        impactEvidence: JSON.parse(outcome.impactEvidence || "[]"),
        challenges: JSON.parse(outcome.challenges || "[]"),
        reachRate: outcome.targetBeneficiaries > 0 
          ? Math.round((outcome.reachedBeneficiaries / outcome.targetBeneficiaries) * 10000) / 100
          : 0,
        daysActive: Math.ceil((Date.now() - outcome.startDate.getTime()) / (1000 * 60 * 60 * 24)),
        isActive: outcome.endDate >= new Date(),
      }));

      // Aggregate statistics
      const aggregateStats = outcomes.reduce((acc, outcome) => {
        acc.totalTarget += outcome.targetBeneficiaries;
        acc.totalReached += outcome.reachedBeneficiaries;
        acc.activePrograms += outcome.endDate >= new Date() ? 1 : 0;
        return acc;
      }, { totalTarget: 0, totalReached: 0, activePrograms: 0 });

      return NextResponse.json(
        {
          data: outcomesWithMetrics,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            aggregate: {
              ...aggregateStats,
              overallReachRate: aggregateStats.totalTarget > 0 
                ? Math.round((aggregateStats.totalReached / aggregateStats.totalTarget) * 10000) / 100
                : 0,
            },
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_OUTCOMES_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch outcomes" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.IMPACT_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = OutcomeCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid outcome data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify program exists if provided
      if (body.programId) {
        const program = await prisma.nonprofitProgram.findFirst({
          where: { id: body.programId, storeId },
        });
        
        if (!program) {
          return NextResponse.json(
            { error: "Program not found" },
            { status: 404, headers: standardHeaders(requestId) }
          );
        }
      }

      const outcome = await prisma.nonprofitOutcome.create({
        data: {
          storeId,
          title: body.title,
          description: body.description,
          beneficiaryType: body.beneficiaryType,
          targetBeneficiaries: body.targetBeneficiaries,
          reachedBeneficiaries: body.reachedBeneficiaries,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          programId: body.programId,
          location: body.location,
          demographicBreakdown: JSON.stringify(body.demographicBreakdown),
          impactEvidence: JSON.stringify(body.impactEvidence),
          challenges: JSON.stringify(body.challenges),
          lessonsLearned: body.lessonsLearned,
          sustainability: body.sustainability,
        },
        include: {
          program: {
            select: {
              name: true,
            },
          },
        },
      });

      return NextResponse.json(outcome, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_OUTCOMES_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create outcome" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);