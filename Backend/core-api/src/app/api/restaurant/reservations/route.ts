import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const CreateReservationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Phone number is required"),
  customerEmail: z.string().email().optional(),
  partySize: z.number().min(1).max(20),
  dateTime: z.string().datetime(),
  duration: z.number().min(30).max(240).default(90),
  tableId: z.string().optional(),
  specialRequests: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CHECKED_IN", "CANCELLED", "NO_SHOW"]).default("PENDING"),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_RESERVATIONS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const status = searchParams.get("status") as any;
      const date = searchParams.get("date");
      const search = searchParams.get("search");
      
      const where: any = { storeId };
      
      if (status) {
        where.status = status;
      }
      
      if (date) {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        
        where.dateTime = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
      
      if (search) {
        where.OR = [
          { customerName: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search } },
          { customerEmail: { contains: search, mode: "insensitive" } },
        ];
      }
      
      const reservations = await db.reservation.findMany({
        where,
        orderBy: { dateTime: "asc" },
        include: {
          table: {
            select: {
              tableNumber: true,
              section: true,
              capacity: true,
            },
          },
        },
      });
      
      // Get upcoming reservations summary
      const upcomingSummary = await db.reservation.groupBy({
        by: ["status"],
        where: {
          storeId,
          dateTime: {
            gte: new Date(),
          },
        },
        _count: true,
      });
      
      return NextResponse.json({
        success: true,
        data: reservations,
        summary: {
          upcoming: upcomingSummary.reduce((acc: any, item: any) => {
            acc[item.status] = item._count;
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
      
      logger.error("[RESTAURANT_RESERVATIONS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RESERVATIONS_FETCH_FAILED",
            message: "Failed to fetch reservations",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.RESTAURANT_RESERVATIONS_MANAGE,
  async (req, { storeId, db, user }) => {
    try {
      const body = await req.json();
      const validatedData = CreateReservationSchema.parse(body);
      
      // Check table availability if table specified
      if (validatedData.tableId) {
        const table = await db.table.findUnique({
          where: { id: validatedData.tableId, storeId },
        });
        
        if (!table) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "TABLE_NOT_FOUND",
                message: "Specified table not found",
              },
            },
            { status: 404 }
          );
        }
        
        if (table.capacity < validatedData.partySize) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "TABLE_TOO_SMALL",
                message: "Selected table is too small for party size",
                details: {
                  tableCapacity: table.capacity,
                  partySize: validatedData.partySize,
                },
              },
            },
            { status: 400 }
          );
        }
        
        // Check for conflicting reservations
        const reservationEndTime = new Date(validatedData.dateTime);
        reservationEndTime.setMinutes(reservationEndTime.getMinutes() + validatedData.duration);
        
        const conflictingReservations = await db.reservation.count({
          where: {
            storeId,
            tableId: validatedData.tableId,
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
            dateTime: {
              lte: reservationEndTime,
            },
            endTime: {
              gte: new Date(validatedData.dateTime),
            },
          },
        });
        
        if (conflictingReservations > 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "TABLE_UNAVAILABLE",
                message: "Table is not available at the requested time",
              },
            },
            { status: 409 }
          );
        }
      }
      
      // Create reservation
      const reservationData: any = {
        ...validatedData,
        storeId,
        createdBy: user.id,
      };
      
      // Calculate end time
      const endTime = new Date(validatedData.dateTime);
      endTime.setMinutes(endTime.getMinutes() + validatedData.duration);
      reservationData.endTime = endTime;
      
      const reservation = await db.reservation.create({
        data: reservationData,
        include: {
          table: {
            select: {
              tableNumber: true,
              section: true,
            },
          },
        },
      });
      
      logger.info("[RESTAURANT_RESERVATION_CREATED]", {
        reservationId: reservation.id,
        customerName: validatedData.customerName,
        dateTime: validatedData.dateTime,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: reservation,
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
      
      logger.error("[RESTAURANT_RESERVATIONS_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RESERVATION_CREATE_FAILED",
            message: "Failed to create reservation",
          },
        },
        { status: 500 }
      );
    }
  }
);