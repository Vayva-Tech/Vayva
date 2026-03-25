import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const MenuQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  category: z.string().optional(),
  stationId: z.string().optional(),
  activeOnly: z.boolean().default(true),
  search: z.string().optional(),
});

const MenuItemCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  price: z.number().positive(),
  stationId: z.string(),
  prepTime: z.number().int().positive(),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  seasonal: z.boolean().default(false),
  popularity: z.number().int().min(0).max(100).default(0),
});

export const GET = withVayvaAPI(
  PERMISSIONS.KITCHEN_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = MenuQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        category: searchParams.get("category"),
        stationId: searchParams.get("stationId"),
        activeOnly: searchParams.get("activeOnly") === "true",
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.activeOnly && { active: true }),
        ...(parseResult.category && { category: parseResult.category }),
        ...(parseResult.stationId && { stationId: parseResult.stationId }),
        ...(parseResult.search && {
          OR: [
            { name: { contains: parseResult.search, mode: "insensitive" } },
            { description: { contains: parseResult.search, mode: "insensitive" } },
          ],
        }),
      };

      const [menuItems, total] = await Promise.all([
        prisma.kitchenMenuItem.findMany({
          where: whereClause,
          include: {
            station: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            _count: {
              select: {
                orderItems: {
                  where: {
                    order: { status: { not: "cancelled" } },
                  },
                },
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { name: "asc" },
        }),
        prisma.kitchenMenuItem.count({ where: whereClause }),
      ]);

      return NextResponse.json(
        {
          data: menuItems,
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
      logger.error("[KITCHEN_MENU_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch menu items" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.KITCHEN_MANAGE,
  async (req: NextRequest, { storeId, _user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = MenuItemCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid menu item data",
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

      const createdMenuItem = await prisma.kitchenMenuItem.create({
        data: {
          ...parseResult.data,
          storeId,
        },
        include: {
          station: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      });

      logger.info("[KITCHEN_MENU_ITEM_CREATE]", {
        menuItemId: createdMenuItem.id,
        name: createdMenuItem.name,
        station: station.name,
      });

      return NextResponse.json(
        { data: createdMenuItem },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[KITCHEN_MENU_ITEM_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create menu item" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);