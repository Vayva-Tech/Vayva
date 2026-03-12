import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const AvailabilityQuerySchema = z.object({
  date: z.string().datetime(),
  partySize: z.number().min(1).max(20).default(2),
  duration: z.number().min(30).max(240).default(90),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_RESERVATIONS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const dateStr = searchParams.get("date");
      const partySize = parseInt(searchParams.get("partySize") || "2");
      const duration = parseInt(searchParams.get("duration") || "90");
      
      const queryData = { date: dateStr, partySize, duration };
      const { date, partySize: validatedPartySize, duration: validatedDuration } = AvailabilityQuerySchema.parse(queryData);
      
      const checkDateTime = new Date(date);
      
      // Get all active tables that can accommodate the party size
      const suitableTables = await db.table.findMany({
        where: {
          storeId,
          isActive: true,
          capacity: {
            gte: validatedPartySize,
          },
        },
        select: {
          id: true,
          tableNumber: true,
          section: true,
          capacity: true,
        },
        orderBy: [
          { section: "asc" },
          { capacity: "asc" },
        ],
      });
      
      // Check availability for each time slot throughout the day
      const timeSlots = [];
      const startHour = 11; // 11 AM
      const endHour = 22;   // 10 PM
      
      for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(checkDateTime);
          slotTime.setHours(hour, minute, 0, 0);
          
          // Skip past times
          if (slotTime < new Date()) continue;
          
          const slotEndTime = new Date(slotTime.getTime() + validatedDuration * 60000);
          
          // Check table availability for this time slot
          const availableTables = [];
          
          for (const table of suitableTables) {
            const conflictingReservations = await db.reservation.count({
              where: {
                storeId,
                tableId: table.id,
                status: { in: ["CONFIRMED", "CHECKED_IN"] },
                dateTime: {
                  lte: slotEndTime,
                },
                endTime: {
                  gte: slotTime,
                },
              },
            });
            
            if (conflictingReservations === 0) {
              availableTables.push(table);
            }
          }
          
          timeSlots.push({
            time: slotTime.toISOString(),
            availableTables: availableTables.length,
            totalSuitableTables: suitableTables.length,
            availabilityPercentage: Math.round((availableTables.length / suitableTables.length) * 100),
            isFullyBooked: availableTables.length === 0,
            isOpen: availableTables.length > 0,
          });
        }
      }
      
      return NextResponse.json({
        success: true,
        data: {
          date: checkDateTime.toISOString(),
          partySize: validatedPartySize,
          duration: validatedDuration,
          timeSlots,
          summary: {
            totalSlots: timeSlots.length,
            availableSlots: timeSlots.filter(slot => slot.isOpen).length,
            busySlots: timeSlots.filter(slot => !slot.isOpen).length,
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
      
      logger.error("[RESTAURANT_RESERVATIONS_AVAILABILITY_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RESERVATION_AVAILABILITY_FETCH_FAILED",
            message: "Failed to fetch reservation availability",
          },
        },
        { status: 500 }
      );
    }
  }
);