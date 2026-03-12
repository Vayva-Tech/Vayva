import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const QuerySchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "READY", "COMPLETED", "CANCELLED"]).optional(),
  station: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default("50"),
  page: z.string().transform(Number).pipe(z.number().positive()).default("1"),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_KDS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const queryData = Object.fromEntries(searchParams.entries());
      const { status, station, limit, page } = QuerySchema.parse(queryData);
      
      const where: any = { storeId };
      
      if (status) {
        where.status = status;
      }
      
      if (station) {
        where.station = station;
      }
      
      // Get tickets with related data
      const [tickets, total] = await Promise.all([
        db.kitchenTicket.findMany({
          where,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: [
            { priority: "desc" },
            { createdAt: "asc" }, // FIFO for same priority
          ],
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                customerName: true,
                tableNumber: true,
                status: true,
                total: true,
                createdAt: true,
              },
            },
          },
        }),
        db.kitchenTicket.count({ where }),
      ]);
      
      // Get station summary
      const stationSummary = await db.kitchenTicket.groupBy({
        by: ["station", "status"],
        where: { storeId },
        _count: true,
      });
      
      // Get priority summary
      const prioritySummary = await db.kitchenTicket.groupBy({
        by: ["priority"],
        where: { storeId, status: { not: "COMPLETED" } },
        _count: true,
      });
      
      return NextResponse.json({
        success: true,
        data: tickets,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        summary: {
          stations: stationSummary.reduce((acc: any, item: any) => {
            if (!acc[item.station]) acc[item.station] = {};
            acc[item.station][item.status] = item._count;
            return acc;
          }, {}),
          priorities: prioritySummary.reduce((acc: any, item: any) => {
            acc[item.priority] = item._count;
            return acc;
          }, {}),
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
      
      logger.error("[RESTAURANT_KDS_TICKETS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "KDS_TICKETS_FETCH_FAILED",
            message: "Failed to fetch kitchen tickets",
          },
        },
        { status: 500 }
      );
    }
  }
);