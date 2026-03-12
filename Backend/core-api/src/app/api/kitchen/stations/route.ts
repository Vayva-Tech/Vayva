import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const StationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.enum(["prep", "cook", "assembly", "plating", "beverage", "pastry"]).optional(),
  status: z.enum(["active", "inactive", "maintenance"]).optional(),
  search: z.string().optional(),
});

const StationCreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["prep", "cook", "assembly", "plating", "beverage", "pastry"]),
  description: z.string().optional(),
  capacity: z.number().int().positive().default(1),
  equipment: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const GET = withVayvaAPI(
  PERMISSIONS.KITCHEN_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = StationQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        type: searchParams.get("type"),
        status: searchParams.get("status"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.type && { type: parseResult.type }),
        ...(parseResult.status && { 
          active: parseResult.status === "active" || parseResult.status === "maintenance" 
        }),
        ...(parseResult.search && {
          OR: [
            { name: { contains: parseResult.search, mode: "insensitive" } },
            { description: { contains: parseResult.search, mode: "insensitive" } },
          ],
        }),
      };

      const [stations, total] = await Promise.all([
        prisma.kitchenStation.findMany({
          where: whereClause,
          include: {
            _count: {
              select: {
                assignedOrders: {
                  where: { status: { not: "completed" } },
                },
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { sortOrder: "asc" },
        }),
        prisma.kitchenStation.count({ where: whereClause }),
      ]);

      return NextResponse.json(
        {
          data: stations,
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
      logger.error("[KITCHEN_STATIONS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch kitchen stations" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.KITCHEN_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = StationCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid station data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const createdStation = await prisma.kitchenStation.create({
        data: {
          ...parseResult.data,
          storeId,
        },
      });

      logger.info("[KITCHEN_STATION_CREATE]", {
        stationId: createdStation.id,
        name: createdStation.name,
        type: createdStation.type,
      });

      return NextResponse.json(
        { data: createdStation },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[KITCHEN_STATION_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create kitchen station" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);