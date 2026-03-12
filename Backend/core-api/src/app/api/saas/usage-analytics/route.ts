import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@vayva/db";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

const recordUsageSchema = z.object({
  tenantId: z.string(),
  metricType: z.enum(["api_calls", "storage_gb", "users", "projects", "bandwidth"]),
  metricValue: z.number().min(0),
  periodType: z.enum(["hourly", "daily", "monthly"]).default("daily"),
  metadata: z.record(z.any()).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const tenantId = searchParams.get("tenantId");
      const metricType = searchParams.get("metricType");
      const periodType = searchParams.get("periodType") || "daily";
      const days = parseInt(searchParams.get("days") || "30", 10);

      const where: Record<string, unknown> = {
        storeId,
        periodType,
      };

      if (tenantId) where.tenantId = tenantId;
      if (metricType) where.metricType = metricType;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [metrics, total, aggregated] = await Promise.all([
        prisma.saaSUsageMetric.findMany({
          where: {
            ...where,
            periodStart: { gte: startDate },
          },
          orderBy: { periodStart: "desc" },
          take: 1000,
          include: {
            tenant: { select: { id: true, name: true, tenantCode: true } },
          },
        }),
        prisma.saaSUsageMetric.count({
          where: {
            ...where,
            periodStart: { gte: startDate },
          },
        }),
        // Aggregate metrics by type
        prisma.saaSUsageMetric.groupBy({
          by: ["metricType"],
          where: {
            storeId,
            periodStart: { gte: startDate },
          },
          _sum: { metricValue: true },
          _avg: { metricValue: true },
          _count: { metricType: true },
        }),
      ]);

      return NextResponse.json(
        { metrics, total, aggregated, days },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_USAGE_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch usage metrics" },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const body = await request.json();
      const data = recordUsageSchema.parse(body);

      const periodStart = new Date();
      periodStart.setMinutes(0, 0, 0);

      const periodEnd = new Date(periodStart);
      if (data.periodType === "hourly") {
        periodEnd.setHours(periodEnd.getHours() + 1);
      } else if (data.periodType === "daily") {
        periodEnd.setDate(periodEnd.getDate() + 1);
      } else if (data.periodType === "monthly") {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const metric = await prisma.saaSUsageMetric.create({
        data: {
          storeId,
          tenantId: data.tenantId,
          metricType: data.metricType,
          metricValue: data.metricValue,
          periodType: data.periodType,
          periodStart,
          periodEnd,
          metadata: data.metadata ? JSON.stringify(data.metadata) : Prisma.JsonNull,
        },
      });

      return NextResponse.json(
        { metric },
        { status: 201, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[SAAS_USAGE_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to record usage metric" },
        { status: 500 }
      );
    }
  }
);
