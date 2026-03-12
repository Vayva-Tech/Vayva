import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ImpactQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  period: z.enum(["monthly", "quarterly", "annual"]).default("monthly"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
  goalId: z.string().optional(),
});

const ImpactCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  metricType: z.enum(["count", "percentage", "currency", "duration"]),
  targetValue: z.number(),
  currentValue: z.number().default(0),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  goalId: z.string().optional(),
  methodology: z.string().optional(),
  dataSources: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.IMPACT_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = ImpactQuerySchema.safeParse(
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

      const { page, limit, period, startDate, endDate, category, goalId } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (category) where.category = category;
      if (goalId) where.goalId = goalId;
      if (startDate) where.startDate = { gte: new Date(startDate) };
      if (endDate) where.endDate = { lte: new Date(endDate) };

      const [metrics, total] = await Promise.all([
        prisma.nonprofitImpactMetric.findMany({
          where,
          include: {
            goal: {
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
        prisma.nonprofitImpactMetric.count({ where }),
      ]);

      // Calculate progress percentages and derived metrics
      const metricsWithProgress = metrics.map(metric => {
        const progressPercentage = metric.targetValue > 0 
          ? Math.min(100, Math.round((metric.currentValue / metric.targetValue) * 10000) / 100)
          : 0;
          
        const isOnTrack = progressPercentage >= this.calculateExpectedProgress(
          metric.startDate, 
          metric.endDate, 
          progressPercentage
        );

        return {
          ...metric,
          dataSources: JSON.parse(metric.dataSources || "[]"),
          progressPercentage,
          remainingValue: Math.max(0, metric.targetValue - metric.currentValue),
          isOnTrack,
          daysRemaining: Math.ceil((metric.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          status: progressPercentage >= 100 ? "completed" : 
                 progressPercentage >= 75 ? "ahead" :
                 progressPercentage >= 50 ? "on_track" : "behind",
        };
      });

      // Aggregate by category
      const categorySummary = metricsWithProgress.reduce((acc: Record<string, any>, metric) => {
        if (!acc[metric.category]) {
          acc[metric.category] = {
            count: 0,
            totalTarget: 0,
            totalCurrent: 0,
            completed: 0,
            onTrack: 0,
          };
        }
        
        acc[metric.category].count++;
        acc[metric.category].totalTarget += metric.targetValue;
        acc[metric.category].totalCurrent += metric.currentValue;
        if (metric.progressPercentage >= 100) acc[metric.category].completed++;
        if (metric.isOnTrack) acc[metric.category].onTrack++;
        
        return acc;
      }, {});

      return NextResponse.json(
        {
          data: metricsWithProgress,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            summary: {
              overallProgress: metricsWithProgress.length > 0 
                ? Math.round(metricsWithProgress.reduce((sum, m) => sum + m.progressPercentage, 0) / metricsWithProgress.length * 100) / 100
                : 0,
              completedMetrics: metricsWithProgress.filter(m => m.progressPercentage >= 100).length,
              onTrackMetrics: metricsWithProgress.filter(m => m.isOnTrack).length,
              behindMetrics: metricsWithProgress.filter(m => !m.isOnTrack && m.progressPercentage < 100).length,
              categorySummary,
            },
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_IMPACT_METRICS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch impact metrics" },
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
      const parseResult = ImpactCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid impact metric data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify goal exists if provided
      if (body.goalId) {
        const goal = await prisma.nonprofitGoal.findFirst({
          where: { id: body.goalId, storeId },
        });
        
        if (!goal) {
          return NextResponse.json(
            { error: "Goal not found" },
            { status: 404, headers: standardHeaders(requestId) }
          );
        }
      }

      const metric = await prisma.nonprofitImpactMetric.create({
        data: {
          storeId,
          title: body.title,
          description: body.description,
          category: body.category,
          metricType: body.metricType,
          targetValue: body.targetValue,
          currentValue: body.currentValue,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          goalId: body.goalId,
          methodology: body.methodology,
          dataSources: JSON.stringify(body.dataSources),
          notes: body.notes,
        },
        include: {
          goal: {
            select: {
              name: true,
            },
          },
        },
      });

      return NextResponse.json(metric, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_IMPACT_METRICS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create impact metric" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Calculate expected progress percentage based on timeline
function calculateExpectedProgress(startDate: Date, endDate: Date, currentProgress: number): number {
  const totalTime = endDate.getTime() - startDate.getTime();
  const elapsed = Date.now() - startDate.getTime();
  
  if (totalTime <= 0) return 100;
  
  const expectedProgress = Math.min(100, (elapsed / totalTime) * 100);
  return expectedProgress;
}