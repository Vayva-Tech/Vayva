import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";

/**
 * Public API endpoint for fetching delivery tracking information
 * This endpoint is designed to be accessed by customers via tracking links
 * Only returns limited, non-sensitive information
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingCode = searchParams.get("code");

  if (!trackingCode) {
    return NextResponse.json(
      { success: false, error: "Tracking code is required" },
      { status: 400 }
    );
  }

  try {
    // Find shipment by tracking code
    const shipment = await prisma.shipment.findFirst({
      where: { trackingCode },
      include: {
        order: {
          select: {
            refCode: true,
            status: true,
            total: true,
            subtotal: true,
            shippingTotal: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
        store: {
          select: {
            name: true,
            slug: true,
          },
        },
        dispatchJobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            deliveryEta: true,
          },
        },
        trackingEvents: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            status: true,
            locationText: true,
            description: true,
            occurredAt: true,
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: "Tracking code not found" },
        { status: 404 }
      );
    }

    // Map status to customer-friendly display
    const statusDisplayMap: Record<string, { label: string; description: string }> = {
      CREATED: { label: "Order Received", description: "Your order has been received and is being prepared" },
      REQUESTED: { label: "Delivery Requested", description: "A delivery driver has been requested" },
      ACCEPTED: { label: "Driver Assigned", description: "A driver has been assigned to your delivery" },
      ASSIGNED: { label: "Driver Assigned", description: "A driver has been assigned to your delivery" },
      PICKED_UP: { label: "Picked Up", description: "Your order has been picked up by the driver" },
      IN_TRANSIT: { label: "In Transit", description: "Your order is on its way to you" },
      DELIVERED: { label: "Delivered", description: "Your order has been delivered" },
      FAILED: { label: "Delivery Failed", description: "There was an issue with delivery. Please contact support" },
      CANCELED: { label: "Canceled", description: "This delivery has been canceled" },
    };

    const statusInfo = statusDisplayMap[shipment.status] || {
      label: shipment.status,
      description: "Your delivery status is being updated",
    };

    const fallbackTrackingStatus = (() => {
      switch (shipment.status) {
        case "PICKED_UP":
          return "PICKED_UP";
        case "IN_TRANSIT":
          return "IN_TRANSIT";
        case "DELIVERED":
          return "DELIVERED";
        case "FAILED":
          return "FAILED";
        default:
          return "PENDING";
      }
    })();

    // Build timeline from tracking events
    const timeline = shipment.trackingEvents.map((event) => ({
      status: event.status,
      location: event.locationText,
      note: event.description,
      timestamp: event.occurredAt.toISOString(),
    }));

    // If no tracking events, create a basic timeline from current status
    if (timeline.length === 0) {
      timeline.push({
        status: fallbackTrackingStatus as any,
        location: shipment.addressCity || null,
        note: statusInfo.description,
        timestamp: shipment.updatedAt.toISOString(),
      });
    }

    // Return limited public information (no sensitive data)
    const notesJson = (() => {
      if (!shipment.notes) return undefined;
      try {
        return JSON.parse(shipment.notes) as unknown;
      } catch {
        return undefined;
      }
    })();

    const kwikMeta = (() => {
      if (shipment.provider !== "KWIK") return undefined;
      if (!notesJson || typeof notesJson !== "object" || notesJson === null)
        return undefined;
      const n = notesJson as Record<string, unknown>;
      const cod = n.cod && typeof n.cod === "object" && n.cod !== null
        ? (n.cod as Record<string, unknown>)
        : undefined;
      return {
        uniqueOrderId:
          typeof n.unique_order_id === "string" ? n.unique_order_id : undefined,
        customerId:
          typeof n.customer_id === "number"
            ? n.customer_id
            : typeof n.customer_id === "string"
              ? Number(n.customer_id)
              : undefined,
        jobHash: typeof n.job_hash === "string" ? n.job_hash : undefined,
        cod: cod
          ? {
              enabled: Boolean(cod.enabled),
              amount:
                typeof cod.amount === "number"
                  ? cod.amount
                  : typeof cod.amount === "string"
                    ? Number(cod.amount)
                    : undefined,
              includesDelivery: Boolean(cod.includesDelivery),
            }
          : undefined,
      };
    })();

    const live = await (async () => {
      if (shipment.provider !== "KWIK") return null;
      if (!kwikMeta?.uniqueOrderId || !kwikMeta.customerId) return null;

      // Kwik's APIary docs expose job status via querystring; treat as public-safe.
      const base =
        process.env.KWIK_PUBLIC_STATUS_BASE_URL ||
        "https://staging-api-test.kwik.delivery";
      const url = new URL("/getJobStatus", base);
      url.searchParams.set("unique_order_id", kwikMeta.uniqueOrderId);
      url.searchParams.set("customer_id", String(kwikMeta.customerId));

      try {
        const r = await fetch(url.toString(), {
          method: "GET",
          headers: { "Accept": "application/json" },
          cache: "no-store",
        });
        if (!r.ok) return null;
        const data = (await r.json()) as any;

        // Best-effort extraction; Kwik payload shape varies by environment.
        const rider = data?.data?.fleet || data?.data?.agent || data?.fleet;
        const pickup = data?.data?.pickup || data?.pickup;
        const delivery = data?.data?.delivery || data?.delivery;

        const toPoint = (obj: any) => {
          const lat =
            obj?.latitude ?? obj?.lat ?? obj?.job_lat ?? obj?.job_latitude;
          const lng =
            obj?.longitude ?? obj?.lng ?? obj?.job_lng ?? obj?.job_longitude;
          const nLat = typeof lat === "string" ? Number(lat) : lat;
          const nLng = typeof lng === "string" ? Number(lng) : lng;
          if (typeof nLat !== "number" || typeof nLng !== "number") return null;
          if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return null;
          return { lat: nLat, lng: nLng };
        };

        return {
          provider: "KWIK",
          rider: rider
            ? {
                name: rider?.name ?? null,
                phone:
                  typeof rider?.phone === "string"
                    ? `****${rider.phone.slice(-4)}`
                    : null,
                location: toPoint(rider),
              }
            : null,
          pickup: pickup ? { location: toPoint(pickup) } : null,
          delivery: delivery ? { location: toPoint(delivery) } : null,
          rawStatus:
            data?.data?.job_status ??
            data?.data?.status ??
            data?.job_status ??
            data?.status ??
            null,
          lastSyncAt: new Date().toISOString(),
        };
      } catch {
        return null;
      }
    })();

    const response = {
      success: true,
      tracking: {
        code: shipment.trackingCode,
        status: shipment.status,
        statusLabel: statusInfo.label,
        statusDescription: statusInfo.description,
        provider: shipment.provider,
        estimatedDelivery: shipment.dispatchJobs[0]?.deliveryEta || null,
        timeline,
        recipient: {
          name: shipment.recipientName,
          // Mask phone number - only show last 4 digits
          phone: shipment.recipientPhone
            ? `****${shipment.recipientPhone.slice(-4)}`
            : null,
          address: {
            line1: shipment.addressLine1,
            city: shipment.addressCity,
            state: shipment.addressState,
          },
        },
        order: {
          refCode: shipment.order.refCode,
          total: Number(shipment.order.total),
          subtotal: Number(shipment.order.subtotal),
          shippingTotal: Number(shipment.order.shippingTotal),
          paymentStatus: shipment.order.paymentStatus,
          createdAt: shipment.order.createdAt.toISOString(),
        },
        store: {
          name: shipment.store.name,
          slug: shipment.store.slug,
        },
        // Include Kwik tracking URL if available
        externalTrackingUrl: shipment.trackingUrl || null,
        payment: {
          cod: kwikMeta?.cod?.enabled
            ? {
                amount: kwikMeta.cod.amount ?? null,
                includesDelivery: Boolean(kwikMeta.cod.includesDelivery),
              }
            : null,
        },
        live,
        lastUpdated: shipment.updatedAt.toISOString(),
      },
    };

    // Add cache headers for CDN optimization
    // Short cache since tracking status changes frequently
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[TRACKING_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tracking information" },
      { status: 500 }
    );
  }
}
