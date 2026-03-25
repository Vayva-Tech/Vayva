import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

type StylistStatusRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "busy" | "available" | "off_duty";
  currentClient: {
    name: string;
    service: string;
    endTime: number;
  } | null;
  nextAppointment: {
    time: Date;
    serviceName: string;
    customerName: string;
  } | null;
  appointmentsToday: number;
  revenueToday: number;
  utilizationRate: number;
};

/**
 * GET /api/beauty/stylists/availability
 * Returns stylist availability and current status (store-level bookings; no per-stylist assignment in schema).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);
    const now = new Date();

    const [memberships, todayBookings] = await Promise.all([
      prisma.membership.findMany({
        where: { storeId, status: "ACTIVE" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.booking.findMany({
        where: {
          storeId,
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
              price: true,
            },
          },
        },
        orderBy: {
          startsAt: "asc",
        },
      }),
    ]);

    const stylistsWithStatus: StylistStatusRow[] = memberships.map((m, index) => {
      const stylist = m.user;
      const assigned =
        todayBookings.filter((_, i) => i % Math.max(memberships.length, 1) === index) ?? [];

      const currentAppointment = assigned.find((apt) => {
        const aptStart = new Date(apt.startsAt);
        const aptEnd = new Date(apt.endsAt || aptStart.getTime() + 60 * 60 * 1000);
        return now >= aptStart && now <= aptEnd;
      });

      const nextAppointment = assigned.find((apt) => {
        const aptStart = new Date(apt.startsAt);
        return aptStart > now;
      });

      let status: "busy" | "available" | "off_duty" = "off_duty";
      if (currentAppointment) {
        status = "busy";
      } else if (nextAppointment || assigned.length > 0) {
        status = "available";
      }

      const todayRevenue = assigned
        .filter((apt) => apt.status === "COMPLETED")
        .reduce((sum, apt) => sum + (Number(apt.service?.price) || 0), 0);

      return {
        id: stylist.id,
        name: `${stylist.firstName ?? ""} ${stylist.lastName ?? ""}`.trim() || stylist.email,
        email: stylist.email,
        role: m.roleName,
        status,
        currentClient: currentAppointment
          ? {
              name: `${currentAppointment.customer?.firstName ?? ""} ${currentAppointment.customer?.lastName ?? ""}`.trim(),
              service: currentAppointment.service?.title || "Service",
              endTime:
                currentAppointment.endsAt?.getTime() ??
                currentAppointment.startsAt.getTime() + 60 * 60 * 1000,
            }
          : null,
        nextAppointment: nextAppointment
          ? {
              time: nextAppointment.startsAt,
              serviceName: nextAppointment.service?.title || "Service",
              customerName: `${nextAppointment.customer?.firstName ?? ""} ${nextAppointment.customer?.lastName ?? ""}`.trim(),
            }
          : null,
        appointmentsToday: assigned.length,
        revenueToday: todayRevenue,
        utilizationRate: Math.min(100, (assigned.length / 8) * 100),
      };
    });

    const totalStylists = stylistsWithStatus.length;
    const busyStylists = stylistsWithStatus.filter((s) => s.status === "busy").length;
    const availableStylists = stylistsWithStatus.filter((s) => s.status === "available").length;
    const offDutyStylists = stylistsWithStatus.filter((s) => s.status === "off_duty").length;

    const topPerformer = stylistsWithStatus.reduce<StylistStatusRow | null>(
      (top, current) =>
        current.revenueToday > (top?.revenueToday ?? 0) ? current : top,
      null
    );

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
        overallUtilization: totalStylists > 0 ? (busyStylists / totalStylists) * 100 : 0,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/stylists/availability",
      operation: "GET_STYLIST_AVAILABILITY",
    });
    return NextResponse.json(
      { error: "Failed to fetch stylist availability" },
      { status: 500 }
    );
  }
}
