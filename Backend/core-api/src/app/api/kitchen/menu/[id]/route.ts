import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.KITCHEN_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const menuItem = await prisma.kitchenMenuItem.findFirst({
        where: { id, storeId },
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
                  order: { status: { not: "cancelled" }, storeId },
                },
              },
            },
          },
        },
      });

      if (!menuItem) {
        return NextResponse.json(
          { error: "Menu item not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      return NextResponse.json(
        { data: menuItem },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: menuItemId } = await params;
      logger.error("[KITCHEN_MENU_ITEM_GET]", { error, menuItemId });
      return NextResponse.json(
        { error: "Failed to fetch menu item" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
