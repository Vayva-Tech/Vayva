// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

/**
 * GET /api/beauty/stylists/availability
 * Returns stylist availability and current status
 */
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);
    const now = new Date();

    // Fetch all stylists
    const stylists = await prisma.user?.findMany({
      where: {
        storeId,
        role: "STYLIST",
      },
      include: {
        bookings: {
          where: {
            startsAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            service: {
              select: {
                title: true,
              },
            },
          },
          orderBy: {
            startsAt: "asc",
          },
        },
      },
    }) || [];

    // Process stylist data
    const stylistsWithStatus = stylists.map((stylist) => {
      const todayBookings = stylist.bookings || [];

      // Find current appointment
      const currentAppointment = todayBookings.find((apt) => {
        const aptStart = new Date(apt.startsAt);
        const aptEnd = new Date(apt.endsAt || aptStart.getTime() + 60 * 60 * 1000);
        return now >= aptStart && now <= aptEnd;
      });

      // Find next appointment
      const nextAppointment = todayBookings.find((apt) => {
        const aptStart = new Date(apt.startsAt);
        return aptStart > now;
      });

      // Determine status
      let status: "busy" | "available" | "off_duty" = "off_duty";
      if (currentAppointment) {
        status = "busy";
      } else if (nextAppointment) {
        status = "available";
      }

      // Calculate revenue for today
      const todayRevenue = todayBookings
        .filter((apt) => apt.status === "COMPLETED")
        .reduce((sum, apt) => sum + (Number(apt.service?.price) || 0), 0);

      return {
        id: stylist.id,
        name: `${stylist.firstName} ${stylist.lastName || ""}`.trim(),
        email: stylist.email,
        role: stylist.role,
        status,
        currentClient: currentAppointment
          ? {
              name: `${currentAppointment.customer.firstName} ${currentAppointment.customer.lastName}`,
              service: currentAppointment.service?.title || "Service",
              endTime: currentAppointment.endsAt || currentAppointment.startsAt.getTime() + 60 * 60 * 1000,
            }
          : null,
        nextAppointment: nextAppointment
          ? {
              time: nextAppointment.startsAt,
              serviceName: nextAppointment.service?.title || "Service",
              customerName: `${nextAppointment.customer.firstName} ${nextAppointment.customer.lastName}`,
            }
          : null,
        appointmentsToday: todayBookings.length,
        revenueToday: todayRevenue,
        utilizationRate: Math.min(100, (todayBookings.length / 8) * 100), // Assuming 8 appointments max per day
      };
    });

    // Calculate overall metrics
    const totalStylists = stylistsWithStatus.length;
    const busyStylists = stylistsWithStatus.filter((s) => s.status === "busy").length;
    const availableStylists = stylistsWithStatus.filter((s) => s.status === "available").length;
    const offDutyStylists = stylistsWithStatus.filter((s) => s.status === "off_duty").length;

    // Top performer
    const topPerformer = stylistsWithStatus.reduce((top, current) =>
      current.revenueToday > (top?.revenueToday || 0) ? current : top
    , null as typeof stylistsWithStatus[0] | null);

    return NextResponse.json({
      success: true,
      data: {
        stylists: stylistsWithStatus,
        summary: {
          total: totalStylists,
          busy: busyStylists,
          available: availableStylists,
          offDuty: offDutyStylists,
        },
        stationStatus: {
          busy: busyStylists,
          free: availableStylists,
          soon: offDutyStylists,
        },
        topPerformer: topPerformer
          ? {
              name: topPerformer.name,
              revenue: topPerformer.revenueToday,
            }
          : null,
        overallUtilization: (busyStylists / totalStylists) * 100 || 0,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/beauty/stylists/availability',
      operation: 'GET_STYLIST_AVAILABILITY',
    });
    return NextResponse.json(
      { error: 'Failed to fetch stylist availability' },
      { status: 500 }
    );
  }
}
