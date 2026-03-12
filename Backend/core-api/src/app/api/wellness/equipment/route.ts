import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const EquipmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "maintenance", "retired", "damaged"]).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPurchaseDate: z.string().datetime().optional(),
  maxPurchaseDate: z.string().datetime().optional(),
  search: z.string().optional(),
});

const EquipmentCreateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().datetime(),
  purchasePrice: z.number().positive(),
  location: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  condition: z.enum(["excellent", "good", "fair", "poor"]).default("good"),
  warrantyExpiration: z.string().datetime().optional(),
  maintenanceSchedule: z.enum(["daily", "weekly", "monthly", "quarterly", "annually"]).optional(),
  notes: z.string().optional(),
  specifications: z.record(z.any()).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.EQUIPMENT_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = EquipmentQuerySchema.safeParse(
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

      const { page, limit, status, category, location, minPurchaseDate, maxPurchaseDate, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (category) where.category = { contains: category, mode: "insensitive" };
      if (location) where.location = { contains: location, mode: "insensitive" };
      if (minPurchaseDate) where.purchaseDate = { gte: new Date(minPurchaseDate) };
      if (maxPurchaseDate) where.purchaseDate = { lte: new Date(maxPurchaseDate) };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { manufacturer: { contains: search, mode: "insensitive" } },
          { model: { contains: search, mode: "insensitive" } },
          { serialNumber: { contains: search, mode: "insensitive" } },
        ];
      }

      const [equipment, total] = await Promise.all([
        prisma.wellnessEquipment.findMany({
          where,
          include: {
            _count: {
              select: {
                maintenanceRecords: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.wellnessEquipment.count({ where }),
      ]);

      // Calculate equipment metrics and depreciation
      const equipmentWithMetrics = equipment.map(item => {
        const ageInYears = (Date.now() - item.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        const depreciationRate = 0.15; // 15% annual depreciation
        const currentValue = item.purchasePrice * Math.pow(1 - depreciationRate, ageInYears);
        
        const lastMaintenance = item._count.maintenanceRecords > 0 
          ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) // Mock recent date
          : null;

        return {
          ...item,
          specifications: JSON.parse(item.specifications || "{}"),
          ageInYears: Math.round(ageInYears * 100) / 100,
          currentValue: Math.round(currentValue * 100) / 100,
          depreciation: Math.round((item.purchasePrice - currentValue) * 100) / 100,
          lastMaintenance,
          maintenanceDue: item.maintenanceSchedule 
            ? this.calculateNextMaintenance(lastMaintenance, item.maintenanceSchedule)
            : null,
          isWarrantyValid: item.warrantyExpiration 
            ? item.warrantyExpiration > new Date()
            : false,
        };
      });

      // Aggregate statistics
      const categoryBreakdown = equipment.reduce((acc: Record<string, number>, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      const statusBreakdown = equipment.reduce((acc: Record<string, number>, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      const totalAssetValue = equipment.reduce((sum, item) => sum + item.purchasePrice, 0);
      const totalCurrentValue = equipmentWithMetrics.reduce((sum, item) => sum + item.currentValue, 0);

      return NextResponse.json(
        {
          data: equipmentWithMetrics,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            summary: {
              totalItems: equipment.length,
              totalAssetValue: Math.round(totalAssetValue * 100) / 100,
              totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
              depreciation: Math.round((totalAssetValue - totalCurrentValue) * 100) / 100,
              categoryBreakdown,
              statusBreakdown,
            },
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_EQUIPMENT_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch equipment" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.EQUIPMENT_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = EquipmentCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid equipment data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      const equipment = await prisma.wellnessEquipment.create({
        data: {
          storeId,
          name: body.name,
          category: body.category,
          manufacturer: body.manufacturer,
          model: body.model,
          serialNumber: body.serialNumber,
          purchaseDate: new Date(body.purchaseDate),
          purchasePrice: body.purchasePrice,
          location: body.location,
          quantity: body.quantity,
          condition: body.condition,
          warrantyExpiration: body.warrantyExpiration ? new Date(body.warrantyExpiration) : null,
          maintenanceSchedule: body.maintenanceSchedule,
          notes: body.notes,
          specifications: JSON.stringify(body.specifications),
          status: "active",
        },
      });

      return NextResponse.json(equipment, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[WELLNESS_EQUIPMENT_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create equipment" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Calculate next maintenance date based on schedule
function calculateNextMaintenance(lastMaintenance: Date | null, schedule: string): Date | null {
  if (!lastMaintenance) return null;
  
  const nextDate = new Date(lastMaintenance);
  switch (schedule) {
    case "daily": nextDate.setDate(nextDate.getDate() + 1); break;
    case "weekly": nextDate.setDate(nextDate.getDate() + 7); break;
    case "monthly": nextDate.setMonth(nextDate.getMonth() + 1); break;
    case "quarterly": nextDate.setMonth(nextDate.getMonth() + 3); break;
    case "annually": nextDate.setFullYear(nextDate.getFullYear() + 1); break;
  }
  return nextDate;
}