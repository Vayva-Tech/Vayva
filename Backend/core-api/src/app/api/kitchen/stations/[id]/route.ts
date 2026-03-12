import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const StationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  equipment: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const station = await prisma.kitchenStation.findFirst({
      where: { id, storeId },
      include: {
        assignedOrders: {
          where: { status: { not: "completed" } },
          include: {
            order: {
              select: {
                id: true,
                tableNumber: true,
                priority: true,
                createdAt: true,
              },
            },
            menuItem: {
              select: {
                name: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            assignedOrders: true,
          },
        },
      },
    });

    if (!station) {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    return NextResponse.json(
      { data: station },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[KITCHEN_STATION_GET]", { error, stationId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch station" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const json = await req.json().catch(() => ({}));
    const parseResult = StationUpdateSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid station data",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const updatedStation = await prisma.kitchenStation.update({
      where: { id_storeId: { id, storeId } },
      data: parseResult.data,
    });

    logger.info("[KITCHEN_STATION_UPDATE]", {
      stationId: id,
      updatedFields: Object.keys(parseResult.data),
    });

    return NextResponse.json(
      { data: updatedStation },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[KITCHEN_STATION_UPDATE]", { error, stationId: params.id });
    return NextResponse.json(
      { error: "Failed to update station" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Check if station has active assignments
    const activeAssignments = await prisma.kitchenOrderItem.count({
      where: {
        stationId: id,
        status: { not: "completed" },
      },
    });

    if (activeAssignments > 0) {
      return NextResponse.json(
        { error: "Cannot delete station with active order assignments" },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    await prisma.kitchenStation.delete({
      where: { id_storeId: { id, storeId } },
    });

    logger.info("[KITCHEN_STATION_DELETE]", { stationId: id });

    return NextResponse.json(
      { message: "Station deleted successfully" },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[KITCHEN_STATION_DELETE]", { error, stationId: params.id });
    return NextResponse.json(
      { error: "Failed to delete station" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}