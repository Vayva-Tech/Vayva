import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const MaintenanceCreateSchema = z.object({
  type: z.enum([
    "preventive",
    "repair",
    "calibration",
    "inspection",
    "replacement",
  ]),
  date: z.string().datetime(),
  performedBy: z.string().min(1),
  cost: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  partsReplaced: z
    .array(
      z.object({
        name: z.string(),
        cost: z.number().nonnegative(),
      }),
    )
    .default([]),
  nextScheduledDate: z.string().datetime().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.EQUIPMENT_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let equipmentIdForLog = "";
    try {
      const { id } = await params;
      equipmentIdForLog = id;

      const equipment = await prisma.wellnessEquipment.findFirst({
        where: { id, storeId },
      });

      if (!equipment) {
        return NextResponse.json(
          { error: "Equipment not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const maintenanceRecords =
        await prisma.wellnessEquipmentMaintenance.findMany({
          where: { equipmentId: id, storeId },
          orderBy: { date: "desc" },
          take: 50,
        });

      const stats = maintenanceRecords.reduce(
        (acc, record) => {
          acc.totalRecords++;
          acc.totalCost += record.cost || 0;
          if (record.type === "preventive") acc.preventive++;
          if (record.type === "repair") acc.repairs++;
          return acc;
        },
        { totalRecords: 0, totalCost: 0, preventive: 0, repairs: 0 },
      );

      const typeBreakdown = maintenanceRecords.reduce(
        (acc: Record<string, { count: number; totalCost: number }>, record) => {
          if (!acc[record.type]) {
            acc[record.type] = { count: 0, totalCost: 0 };
          }
          acc[record.type].count++;
          acc[record.type].totalCost += record.cost || 0;
          return acc;
        },
        {},
      );

      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const recentRecords = maintenanceRecords.filter(
        (r) => r.date >= twelveMonthsAgo,
      );
      const monthlyAverage =
        recentRecords.length > 0
          ? Math.round((recentRecords.length / 12) * 100) / 100
          : 0;

      const preventiveRate =
        stats.totalRecords > 0
          ? Math.round((stats.preventive / stats.totalRecords) * 10000) / 100
          : 0;

      return NextResponse.json(
        {
          data: {
            equipmentId: id,
            equipmentName: equipment.name,
            maintenanceRecords,
            statistics: {
              ...stats,
              averageCost:
                stats.totalRecords > 0
                  ? Math.round((stats.totalCost / stats.totalRecords) * 100) /
                    100
                  : 0,
              preventiveRate,
              repairRate:
                stats.totalRecords > 0
                  ? Math.round((stats.repairs / stats.totalRecords) * 10000) /
                    100
                  : 0,
            },
            typeBreakdown,
            timeline: {
              recentRecords: recentRecords.length,
              monthlyAverage,
              last12Months: recentRecords,
            },
            recommendations: generateMaintenanceRecommendations(
              preventiveRate,
              equipment.maintenanceSchedule,
              equipment.condition,
            ),
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_EQUIPMENT_MAINTENANCE_GET]", {
        error,
        equipmentId: equipmentIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch maintenance records" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.EQUIPMENT_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    let equipmentIdForLog = "";
    try {
      const { id } = await params;
      equipmentIdForLog = id;
      const json = await req.json().catch(() => ({}));
      const parseResult = MaintenanceCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid maintenance data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const body = parseResult.data;

      const equipment = await prisma.wellnessEquipment.findFirst({
        where: { id, storeId },
      });

      if (!equipment) {
        return NextResponse.json(
          { error: "Equipment not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const maintenanceRecord = await prisma.wellnessEquipmentMaintenance.create(
        {
          data: {
            storeId,
            equipmentId: id,
            type: body.type,
            date: new Date(body.date),
            performedBy: body.performedBy,
            cost: body.cost,
            notes: body.notes,
            partsReplaced: JSON.stringify(body.partsReplaced),
            nextScheduledDate: body.nextScheduledDate
              ? new Date(body.nextScheduledDate)
              : null,
          },
        },
      );

      const updateData: { condition?: string } = {};
      if (body.type === "repair" && equipment.condition !== "poor") {
        updateData.condition = "fair";
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.wellnessEquipment.updateMany({
          where: { id, storeId },
          data: updateData,
        });
      }

      return NextResponse.json(maintenanceRecord, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[WELLNESS_EQUIPMENT_MAINTENANCE_POST]", {
        error,
        equipmentId: equipmentIdForLog,
        storeId,
        userId: user?.id,
      });
      return NextResponse.json(
        { error: "Failed to create maintenance record" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

function generateMaintenanceRecommendations(
  preventiveRate: number,
  schedule: string | null,
  condition: string,
): string[] {
  const recommendations: string[] = [];

  if (preventiveRate < 60) {
    recommendations.push(
      "Low preventive maintenance rate - consider increasing scheduled maintenance",
    );
  }

  if (condition === "poor") {
    recommendations.push("Equipment in poor condition - immediate maintenance recommended");
    recommendations.push("Consider equipment replacement evaluation");
  } else if (condition === "fair") {
    recommendations.push(
      "Equipment condition fair - monitor closely and schedule maintenance",
    );
  }

  if (!schedule) {
    recommendations.push(
      "No maintenance schedule configured - establish regular maintenance intervals",
    );
  }

  recommendations.push(
    "Track maintenance costs to identify cost-effective replacement timing",
  );
  recommendations.push(
    "Document all maintenance activities for warranty and compliance purposes",
  );

  return recommendations;
}
