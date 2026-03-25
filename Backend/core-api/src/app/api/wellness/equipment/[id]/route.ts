import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

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
        include: {
          maintenanceRecords: {
            where: { storeId },
            select: {
              id: true,
              type: true,
              date: true,
              cost: true,
              performedBy: true,
              notes: true,
            },
            orderBy: { date: "desc" },
            take: 10,
          },
        },
      });

      if (!equipment) {
        return NextResponse.json(
          { error: "Equipment not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const ageInYears =
        (Date.now() - equipment.purchaseDate.getTime()) /
        (1000 * 60 * 60 * 24 * 365);
      const depreciationRate = 0.15;
      const currentValue =
        equipment.purchasePrice * Math.pow(1 - depreciationRate, ageInYears);

      const totalMaintenanceCost = equipment.maintenanceRecords.reduce(
        (sum, record) => sum + (record.cost || 0),
        0,
      );
      const maintenanceCostRatio = totalMaintenanceCost / equipment.purchasePrice;

      const equipmentWithDetails = {
        ...equipment,
        specifications: JSON.parse(equipment.specifications || "{}"),
        ageInYears: Math.round(ageInYears * 100) / 100,
        currentValue: Math.round(currentValue * 100) / 100,
        depreciation:
          Math.round((equipment.purchasePrice - currentValue) * 100) / 100,
        totalMaintenanceCost: Math.round(totalMaintenanceCost * 100) / 100,
        maintenanceCostRatio:
          Math.round(maintenanceCostRatio * 10000) / 100,
        isWarrantyValid: equipment.warrantyExpiration
          ? equipment.warrantyExpiration > new Date()
          : false,
        warrantyDaysRemaining: equipment.warrantyExpiration
          ? Math.ceil(
              (equipment.warrantyExpiration.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            )
          : null,
        maintenance: {
          records: equipment.maintenanceRecords,
          totalRecords: equipment.maintenanceRecords.length,
          averageCostPerRecord:
            equipment.maintenanceRecords.length > 0
              ? Math.round(
                  (totalMaintenanceCost / equipment.maintenanceRecords.length) *
                    100,
                ) / 100
              : 0,
        },
      };

      return NextResponse.json(
        { data: equipmentWithDetails },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_EQUIPMENT_GET]", {
        error,
        equipmentId: equipmentIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch equipment" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
