import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const CreateTableSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  capacity: z.number().min(1).max(20),
  section: z.string().optional(),
  shape: z.enum(["ROUND", "SQUARE", "RECTANGLE"]).optional(),
  posX: z.number().optional(),
  posY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

const QuerySchema = z.object({
  section: z.string().optional(),
  isActive: z.string().transform((val) => val === "true").optional(),
  hasReservation: z.string().transform((val) => val === "true").optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_TABLES_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const queryData = Object.fromEntries(searchParams.entries());
      const { section, isActive, hasReservation } = QuerySchema.parse(queryData);
      
      const where: any = { storeId };
      
      if (section) {
        where.section = section;
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }
      
      // Get tables with current status
      const tables = await db.table.findMany({
        where,
        orderBy: [
          { section: "asc" },
          { tableNumber: "asc" },
        ],
        include: {
          _count: {
            select: {
              reservations: {
                where: {
                  status: { in: ["CONFIRMED", "CHECKED_IN"] },
                  dateTime: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lte: new Date(new Date().setHours(23, 59, 59, 999)),
                  },
                },
              },
              orders: {
                where: {
                  status: { notIn: ["COMPLETED", "CANCELLED"] },
                },
              },
            },
          },
        },
      });
      
      // Get section summary
      const sectionSummary = await db.table.groupBy({
        by: ["section"],
        where: { storeId },
        _count: true,
        _sum: {
          capacity: true,
        },
      });
      
      // Get occupancy status for today
      const occupancyData = await db.$queryRaw`
        SELECT 
          t.id,
          t."tableNumber",
          t.section,
          t.capacity,
          COUNT(DISTINCT r.id) as reserved_now,
          COUNT(DISTINCT o.id) as occupied_now,
          CASE 
            WHEN COUNT(DISTINCT o.id) > 0 THEN 'OCCUPIED'
            WHEN COUNT(DISTINCT r.id) > 0 THEN 'RESERVED'
            ELSE 'AVAILABLE'
          END as current_status
        FROM "Table" t
        LEFT JOIN "Reservation" r ON t.id = r."tableId" 
          AND r.status IN ('CONFIRMED', 'CHECKED_IN')
          AND r."dateTime" >= NOW() - INTERVAL '2 hours'
          AND r."dateTime" <= NOW() + INTERVAL '2 hours'
        LEFT JOIN "Order" o ON t.id = o."tableId"
          AND o.status NOT IN ('COMPLETED', 'CANCELLED')
        WHERE t."storeId" = ${storeId}
        GROUP BY t.id, t."tableNumber", t.section, t.capacity
      `;
      
      return NextResponse.json({
        success: true,
        data: tables,
        summary: {
          sections: sectionSummary,
          occupancy: occupancyData,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid query parameters",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[RESTAURANT_TABLES_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TABLES_FETCH_FAILED",
            message: "Failed to fetch tables",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.RESTAURANT_TABLES_MANAGE,
  async (req, { storeId, db, user }) => {
    try {
      const body = await req.json();
      const validatedData = CreateTableSchema.parse(body);
      
      // Check for duplicate table number
      const existingTable = await db.table.findFirst({
        where: {
          storeId,
          tableNumber: validatedData.tableNumber,
        },
      });
      
      if (existingTable) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "TABLE_EXISTS",
              message: "Table with this number already exists",
            },
          },
          { status: 409 }
        );
      }
      
      const table = await db.table.create({
        data: {
          ...validatedData,
          storeId,
          createdBy: user.id,
        },
      });
      
      logger.info("[RESTAURANT_TABLE_CREATED]", {
        tableId: table.id,
        tableNumber: validatedData.tableNumber,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: table,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request data",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[RESTAURANT_TABLES_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TABLE_CREATE_FAILED",
            message: "Failed to create table",
          },
        },
        { status: 500 }
      );
    }
  }
);