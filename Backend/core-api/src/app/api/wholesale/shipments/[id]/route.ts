import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const shipment = await prisma.wholesaleShipment.findFirst({
      where: { id, storeId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customer: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
              },
            },
          },
        },
        trackingEvents: {
          select: {
            id: true,
            timestamp: true,
            status: true,
            location: true,
            notes: true,
          },
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate shipment metrics
    const trackingEvents = shipment.trackingEvents;
    const firstEvent = trackingEvents[0];
    const lastEvent = trackingEvents[trackingEvents.length - 1];
    
    const transitTime = firstEvent && lastEvent 
      ? (lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    const shipmentWithTracking = {
      ...shipment,
      tracking: {
        events: trackingEvents,
        currentStatus: lastEvent?.status || shipment.status,
        currentLocation: lastEvent?.location || "Unknown",
        transitDays: Math.round(transitTime),
        isDelivered: shipment.status === "delivered",
        deliveryConfirmed: !!shipment.actualDeliveryDate,
      },
    };

    return NextResponse.json(
      { data: shipmentWithTracking },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WHOLESALE_SHIPMENT_GET]", { error, shipmentId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch shipment" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}