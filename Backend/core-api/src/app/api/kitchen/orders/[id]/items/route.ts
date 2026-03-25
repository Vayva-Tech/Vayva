import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ItemStatusUpdateSchema = z.object({
  itemId: z.string(),
  status: z.enum(["pending", "preparing", "completed"]),
  startTime: z.string().datetime().optional(),
  completionTime: z.string().datetime().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const order = await prisma.kitchenOrder.findFirst({
        where: { id, storeId },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const items = await prisma.kitchenOrderItem.findMany({
        where: {
          orderId: id,
          order: { storeId },
        },
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          station: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json(
        { data: items },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: orderId } = await params;
      logger.error("[KITCHEN_ORDER_ITEMS_GET]", { error, orderId });
      return NextResponse.json(
        { error: "Failed to fetch order items" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const json = await req.json().catch(() => ({}));
      const parseResult = ItemStatusUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid item update data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { itemId, status, startTime, completionTime, assignedTo, notes } =
        parseResult.data;

      const itemScope = {
        id: itemId,
        orderId: id,
        order: { storeId },
      } as const;

      const updateResult = await prisma.kitchenOrderItem.updateMany({
        where: itemScope,
        data: {
          status,
          startTime: startTime ? new Date(startTime) : undefined,
          completionTime: completionTime ? new Date(completionTime) : undefined,
          assignedTo,
          notes,
        },
      });

      if (updateResult.count === 0) {
        return NextResponse.json(
          { error: "Order item not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const updatedItem = await prisma.kitchenOrderItem.findFirst({
        where: itemScope,
        include: {
          menuItem: {
            select: {
              name: true,
            },
          },
          station: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!updatedItem) {
        return NextResponse.json(
          { error: "Order item not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      logger.info("[KITCHEN_ITEM_STATUS_UPDATE]", {
        orderId: id,
        itemId,
        newStatus: status,
      });

      return NextResponse.json(
        { data: updatedItem },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: orderId } = await params;
      logger.error("[KITCHEN_ITEM_STATUS_UPDATE]", { error, orderId });
      return NextResponse.json(
        { error: "Failed to update item status" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
