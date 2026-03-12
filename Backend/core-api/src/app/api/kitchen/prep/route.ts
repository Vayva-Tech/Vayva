import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const PrepListQuerySchema = z.object({
  date: z.string().datetime().optional(),
  stationId: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.KITCHEN_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = PrepListQuerySchema.parse({
        date: searchParams.get("date"),
        stationId: searchParams.get("stationId"),
        status: searchParams.get("status"),
      });

      // Default to today if no date provided
      const targetDate = parseResult.date 
        ? new Date(parseResult.date)
        : new Date();
      
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const whereClause = {
        storeId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
        ...(parseResult.stationId && { stationId: parseResult.stationId }),
        ...(parseResult.status && { status: parseResult.status }),
      };

      const prepItems = await prisma.kitchenPrepItem.findMany({
        where: whereClause,
        include: {
          station: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "asc" },
        ],
      });

      // Group by station for easier display
      const groupedByStation = prepItems.reduce((acc, item) => {
        const stationId = item.stationId;
        if (!acc[stationId]) {
          acc[stationId] = {
            station: item.station,
            items: [],
          };
        }
        acc[stationId].items.push(item);
        return acc;
      }, {} as Record<string, any>);

      const prepListData = {
        date: startOfDay.toISOString().split('T')[0],
        totalItems: prepItems.length,
        statusSummary: prepItems.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byStation: Object.values(groupedByStation),
        allItems: prepItems,
      };

      return NextResponse.json(
        { data: prepListData },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[KITCHEN_PREP_LIST_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch prep list" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

const PrepItemCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  stationId: z.string(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  estimatedTime: z.number().int().positive().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
  })).default([]),
  instructions: z.string().optional(),
});

export const POST = withVayvaAPI(
  PERMISSIONS.KITCHEN_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = PrepItemCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid prep item data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify station exists
      const station = await prisma.kitchenStation.findFirst({
        where: {
          id: parseResult.data.stationId,
          storeId,
        },
      });

      if (!station) {
        return NextResponse.json(
          { error: "Station not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const createdPrepItem = await prisma.kitchenPrepItem.create({
        data: {
          ...parseResult.data,
          storeId,
          status: "pending",
          ingredients: JSON.stringify(parseResult.data.ingredients),
          createdBy: user.id, // From auth context
        },
        include: {
          station: {
            select: {
              name: true,
              type: true,
            },
          },
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      logger.info("[KITCHEN_PREP_ITEM_CREATE]", {
        prepItemId: createdPrepItem.id,
        name: createdPrepItem.name,
        station: station.name,
      });

      return NextResponse.json(
        { data: createdPrepItem },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[KITCHEN_PREP_ITEM_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create prep item" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);