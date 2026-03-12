import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const AvailabilityQuerySchema = z.object({
  date: z.string().datetime().optional(),
  timeSlot: z.string().optional(), // e.g., "18:00"
  duration: z.number().min(30).max(240).default(90), // minutes
});

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_TABLES_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const dateStr = searchParams.get("date");
      const timeSlot = searchParams.get("timeSlot");
      const duration = parseInt(searchParams.get("duration") || "90");
      
      const queryData = { date: dateStr, timeSlot, duration };
      const { date, duration: validatedDuration } = AvailabilityQuerySchema.parse(queryData);
      
      // Determine check datetime
      let checkDateTime: Date;
      if (date) {
        checkDateTime = new Date(date);
      } else if (timeSlot) {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        checkDateTime = new Date();
        checkDateTime.setHours(hours, minutes, 0, 0);
      } else {
        checkDateTime = new Date();
      }
      
      // Calculate time window
      const startTime = new Date(checkDateTime.getTime() - 30 * 60000); // 30 mins before
      const endTime = new Date(checkDateTime.getTime() + (validatedDuration + 30) * 60000); // duration + 30 mins after
      
      // Get all tables
      const allTables = await db.table.findMany({
        where: { storeId, isActive: true },
        select: {
          id: true,
          tableNumber: true,
          section: true,
          capacity: true,
        },
      });
      
      // Get reserved/occupied tables in the time window
      const conflictingReservations = await db.reservation.findMany({
        where: {
          storeId,
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
          dateTime: {
            gte: startTime,
            lte: endTime,
          },
        },
        select: {
          tableId: true,
          dateTime: true,
          duration: true,
          partySize: true,
        },
      });
      
      const conflictingOrders = await db.order.findMany({
        where: {
          storeId,
          tableId: { not: null },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
          createdAt: {
            gte: new Date(Date.now() - 4 * 60 * 60000), // Last 4 hours
          },
        },
        select: {
          tableId: true,
          createdAt: true,
        },
      });
      
      // Create sets of unavailable table IDs
      const reservedTableIds = new Set(conflictingReservations.map(r => r.tableId));
      const occupiedTableIds = new Set(conflictingOrders.map(o => o.tableId));
      
      // Calculate availability
      const availability = allTables.map(table => {
        const isReserved = reservedTableIds.has(table.id);
        const isOccupied = occupiedTableIds.has(table.id);
        const isAvailable = !isReserved && !isOccupied;
        
        return {
          tableId: table.id,
          tableNumber: table.tableNumber,
          section: table.section,
          capacity: table.capacity,
          status: isOccupied ? 'OCCUPIED' : isReserved ? 'RESERVED' : 'AVAILABLE',
          isAvailable,
          conflicts: {
            reservations: conflictingReservations.filter(r => r.tableId === table.id),
            orders: conflictingOrders.filter(o => o.tableId === table.id),
          },
        };
      });
      
      // Group by availability status
      const groupedAvailability = {
        available: availability.filter(a => a.isAvailable),
        reserved: availability.filter(a => a.status === 'RESERVED'),
        occupied: availability.filter(a => a.status === 'OCCUPIED'),
      };
      
      return NextResponse.json({
        success: true,
        data: {
          availability,
          grouped: groupedAvailability,
          timeWindow: {
            checkTime: checkDateTime.toISOString(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: validatedDuration,
          },
          summary: {
            totalTables: allTables.length,
            availableTables: groupedAvailability.available.length,
            reservedTables: groupedAvailability.reserved.length,
            occupiedTables: groupedAvailability.occupied.length,
            availabilityPercentage: Math.round((groupedAvailability.available.length / allTables.length) * 100),
          },
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
      
      logger.error("[RESTAURANT_TABLES_AVAILABILITY_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TABLES_AVAILABILITY_FETCH_FAILED",
            message: "Failed to fetch table availability",
          },
        },
        { status: 500 }
      );
    }
  }
);