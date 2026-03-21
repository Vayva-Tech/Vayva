import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter") || "tonight";

        // Get reservations from bookings table
        const now = new Date();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let dateFilter: any = {};

        switch (filter) {
            case "tonight":
                dateFilter = {
                    startsAt: {
                        gte: startOfDay(now),
                        lte: endOfDay(now),
                    },
                };
                break;
            case "upcoming":
                dateFilter = {
                    startsAt: {
                        gt: endOfDay(now),
                    },
                };
                break;
            case "past":
                dateFilter = {
                    startsAt: {
                        lt: startOfDay(now),
                    },
                };
                break;
            default:
                dateFilter = {};
        }

        const bookings = await prisma.booking?.findMany({
            where: {
                storeId,
                ...dateFilter,
            },
            include: {
                customer: {
                    select: { firstName: true, lastName: true, email: true, phone: true },
                },
                service: {
                    select: { title: true, metadata: true },
                },
            },
            orderBy: { startsAt: "asc" },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reservations = bookings.map((booking: any) => {
            const metadata = (booking.metadata as Record<string, unknown>) || {};
            const serviceMetadata = (booking.service?.metadata as Record<string, unknown>) || {};

            return {
                id: booking.id,
                guestName: booking.customer
                    ? `${booking?.customer?.firstName || ""} ${booking?.customer?.lastName || ""}`.trim()
                    : metadata.guestName || "Guest",
                guestPhone: booking.customer?.phone || metadata.guestPhone || "",
                guestEmail: booking.customer?.email || metadata.guestEmail || "",
                tableName: booking.service?.title || metadata.tableName || "Table",
                tableType: serviceMetadata.tableType || metadata.tableType || "Standard",
                date: booking.startsAt?.toISOString().split("T")[0],
                time: booking.startsAt?.toTimeString().substring(0, 5),
                partySize: metadata.partySize || 2,
                minimumSpend: serviceMetadata.minimumSpend || metadata.minimumSpend || 0,
                bottles: metadata.bottles || [],
                totalAmount: metadata.totalAmount || Number(booking.totalPrice) || 0,
                status: (booking as any).status,
                specialRequests: metadata.specialRequests || booking.notes || "",
                createdAt: booking.createdAt?.toISOString(),
            };
        });

        return NextResponse.json(reservations, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    handleApiError(error, { endpoint: "/api/nightlife/reservations", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
