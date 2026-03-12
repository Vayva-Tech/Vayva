/**
 * Appointment Availability API Route
 * GET /api/healthcare/appointments/availability - Get provider availability
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Provider Availability
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const providerId = searchParams.get("providerId");
      const date = searchParams.get("date"); // YYYY-MM-DD
      const duration = parseInt(searchParams.get("duration") || "30");

      if (!providerId || !date) {
        return NextResponse.json(
          { error: "Provider ID and date are required" },
          { status: 400 }
        );
      }

      // Verify provider exists
      const provider = await prisma.user.findFirst({
        where: {
          id: providerId,
          storeMemberships: {
            some: { storeId, role: { in: ["PROVIDER", "ADMIN", "OWNER"] } }
          }
        },
      });

      if (!provider) {
        return NextResponse.json(
          { error: "Provider not found" },
          { status: 404 }
        );
      }

      const requestedDate = new Date(date);
      const nextDay = new Date(requestedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Get existing appointments for the day
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          providerId,
          merchantId: storeId,
          status: { notIn: ["cancelled", "no_show"] },
          scheduledAt: {
            gte: requestedDate,
            lt: nextDay,
          },
        },
        select: {
          scheduledAt: true,
          duration: true,
        },
        orderBy: { scheduledAt: "asc" },
      });

      // Generate availability slots (assuming 9 AM - 5 PM working hours)
      const workStartTime = new Date(requestedDate);
      workStartTime.setHours(9, 0, 0, 0);
      
      const workEndTime = new Date(requestedDate);
      workEndTime.setHours(17, 0, 0, 0);

      const slots = [];
      const slotInterval = 30; // 30-minute intervals
      
      for (let time = new Date(workStartTime); time < workEndTime; time.setMinutes(time.getMinutes() + slotInterval)) {
        const slotEnd = new Date(time.getTime() + duration * 60000);
        
        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(appt => {
          const apptStart = appt.scheduledAt;
          const apptEnd = new Date(apptStart.getTime() + appt.duration * 60000);
          
          return (
            (time >= apptStart && time < apptEnd) || // Slot start overlaps appointment
            (slotEnd > apptStart && slotEnd <= apptEnd) || // Slot end overlaps appointment
            (time <= apptStart && slotEnd >= apptEnd) // Slot completely encompasses appointment
          );
        });

        slots.push({
          startTime: new Date(time),
          endTime: slotEnd,
          isAvailable: !hasConflict,
          duration: duration,
        });
      }

      // Filter to only available slots
      const availableSlots = slots.filter(slot => slot.isAvailable);

      return NextResponse.json({
        success: true,
        data: {
          provider: {
            id: provider.id,
            name: provider.name,
          },
          date: requestedDate,
          duration: duration,
          totalSlots: slots.length,
          availableSlots: availableSlots.length,
          slots: slots.map(slot => ({
            ...slot,
            startTime: slot.startTime.toISOString(),
            endTime: slot.endTime.toISOString(),
          })),
        },
      });
    } catch (error: unknown) {
      logger.error("[APPOINTMENT_AVAILABILITY_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);