import { logger, ErrorCategory } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { requireAuthFromRequest } from "@/lib/session.server";
import { KwikProvider } from "@/lib/delivery/DeliveryProvider";
import { FEATURES } from "@/lib/env-validation";

function getKwikProvider(): KwikProvider | null {
  if (!FEATURES.DELIVERY_ENABLED) return null;
  return new KwikProvider();
}

/**
 * GET /api/orders/[id]/live-tracking
 * Returns live rider location and delivery details for real-time tracking
 * Requires authentication
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const user = await requireAuthFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;

    // Fetch shipment with order data
    const shipment = await prisma.shipment.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            storeId: true,
            refCode: true,
            status: true,
          },
        },
        store: {
          select: {
            name: true,
          },
        },
        dispatchJobs: {
          where: { carrier: "KWIK" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            providerJobId: true,
            status: true,
            assignedRiderName: true,
            assignedRiderPhone: true,
            vehicleType: true,
            pickupEta: true,
            deliveryEta: true,
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: "Shipment not found" },
        { status: 404 }
      );
    }

    // Verify access
    const hasAccess =
      user.storeId === shipment.order.storeId;

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get Kwik job details if available
    const dispatchJob = shipment.dispatchJobs[0];
    let liveTrackingData = null;

    if (dispatchJob?.providerJobId) {
      const kwikProvider = getKwikProvider();
      try {
        if (kwikProvider) {
          const kwikJobDetails = await kwikProvider.getJobDetails(
            dispatchJob.providerJobId,
          );
          const riderLocation = await kwikProvider.trackRider(
            dispatchJob.providerJobId,
          );

          liveTrackingData = {
          rider: {
            name: kwikJobDetails.rider?.name || dispatchJob.assignedRiderName,
            phone: kwikJobDetails.rider?.phone || dispatchJob.assignedRiderPhone,
            photoUrl: kwikJobDetails.rider?.photoUrl,
            vehicleType: kwikJobDetails.rider?.vehicleType || dispatchJob.vehicleType,
            latitude: riderLocation.latitude || kwikJobDetails.rider?.latitude,
            longitude: riderLocation.longitude || kwikJobDetails.rider?.longitude,
            heading: riderLocation.heading,
            speed: riderLocation.speed,
            lastUpdated: riderLocation.updatedAt,
          },
          pickup: kwikJobDetails.pickup || {
            address: shipment.store?.name,
            city: "",
          },
          delivery: kwikJobDetails.delivery || {
            address: shipment.addressLine1,
            city: shipment.addressCity,
          },
          eta: kwikJobDetails.etaMinutes || dispatchJob.deliveryEta,
          status: kwikJobDetails.status || dispatchJob.status,
        };
        } else {
          throw new Error("Kwik delivery not configured");
        }
      } catch (kwikError) {
        logger.error("[LIVE_TRACKING] Kwik API error:", ErrorCategory.API, kwikError);
        // Return fallback data from our database
        liveTrackingData = {
          rider: {
            name: dispatchJob.assignedRiderName,
            phone: dispatchJob.assignedRiderPhone,
            vehicleType: dispatchJob.vehicleType,
            latitude: null,
            longitude: null,
          },
          pickup: {
            address: shipment.store?.name,
            city: "",
          },
          delivery: {
            address: shipment.addressLine1,
            city: shipment.addressCity,
          },
          eta: dispatchJob.deliveryEta,
          status: dispatchJob.status,
          fallback: true,
        };
      }
    }

    return NextResponse.json({
      success: true,
      tracking: {
        orderId,
        orderRef: shipment.order.refCode,
        trackingCode: shipment.trackingCode,
        status: shipment.status,
        provider: shipment.provider,
        recipient: {
          name: shipment.recipientName,
          phone: shipment.recipientPhone,
          address: {
            line1: shipment.addressLine1,
            city: shipment.addressCity,
            state: shipment.addressState,
          },
        },
        live: liveTrackingData,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("[LIVE_TRACKING_API_ERROR]", ErrorCategory.API, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live tracking data" },
      { status: 500 }
    );
  }
}
