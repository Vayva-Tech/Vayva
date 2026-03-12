import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_TABLES_VIEW,
  async (req, { storeId, db, params }) => {
    try {
      const { id } = await params;
      
      const table = await db.table.findUnique({
        where: { id, storeId },
        include: {
          reservations: {
            where: {
              dateTime: {
                gte: new Date(),
              },
            },
            orderBy: {
              dateTime: "asc",
            },
            take: 5,
          },
          orders: {
            where: {
              status: { notIn: ["COMPLETED", "CANCELLED"] },
            },
            include: {
              orderItems: {
                include: {
                  menuItem: {
                    select: {
                      name: true,
                      price: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              reservations: true,
              orders: {
                where: {
                  status: { notIn: ["COMPLETED", "CANCELLED"] },
                },
              },
            },
          },
        },
      });
      
      if (!table) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "TABLE_NOT_FOUND",
              message: "Table not found",
            },
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: table,
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_TABLE_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TABLE_FETCH_FAILED",
            message: "Failed to fetch table",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.RESTAURANT_TABLES_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      
      const table = await db.table.findUnique({
        where: { id, storeId },
      });
      
      if (!table) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "TABLE_NOT_FOUND",
              message: "Table not found",
            },
          },
          { status: 404 }
        );
      }
      
      const updatedTable = await db.table.update({
        where: { id },
        data: {
          ...body,
          updatedBy: user.id,
        },
      });
      
      logger.info("[RESTAURANT_TABLE_UPDATED]", {
        tableId: id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedTable,
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_TABLE_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TABLE_UPDATE_FAILED",
            message: "Failed to update table",
          },
        },
        { status: 500 }
      );
    }
  }
);