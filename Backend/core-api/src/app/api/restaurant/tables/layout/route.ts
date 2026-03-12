import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_TABLES_VIEW,
  async (req, { storeId, db }) => {
    try {
      // Get all tables with layout coordinates
      const tables = await db.table.findMany({
        where: { storeId, isActive: true },
        select: {
          id: true,
          tableNumber: true,
          section: true,
          posX: true,
          posY: true,
          width: true,
          height: true,
          shape: true,
          capacity: true,
        },
        orderBy: [
          { section: "asc" },
          { tableNumber: "asc" },
        ],
      });
      
      // Get sections for layout organization
      const sections = await db.table.groupBy({
        by: ["section"],
        where: { storeId, isActive: true },
        _count: true,
      });
      
      // Get floor dimensions (from settings or calculate from table positions)
      const maxX = Math.max(...tables.map(t => (t.posX || 0) + (t.width || 100)));
      const maxY = Math.max(...tables.map(t => (t.posY || 0) + (t.height || 100)));
      
      return NextResponse.json({
        success: true,
        data: {
          tables,
          sections: sections.filter(s => s.section),
          floorDimensions: {
            width: Math.max(800, maxX + 100),
            height: Math.max(600, maxY + 100),
          },
        },
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_TABLES_LAYOUT_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TABLES_LAYOUT_FETCH_FAILED",
            message: "Failed to fetch table layout",
          },
        },
        { status: 500 }
      );
    }
  }
);