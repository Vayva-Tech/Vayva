import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";
import { getDeliveryProvider } from "@/lib/delivery/DeliveryProvider";

const TERMINAL_SHIPMENT_STATUSES = ["DELIVERED", "CANCELLED"] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shipmentId } = await params;
    if (!shipmentId || typeof shipmentId !== "string") {
      return NextResponse.json(
        { success: false, error: "Shipment id is required" },
        { status: 400 }
      );
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        order: { select: { id: true, orderNumber: true, refCode: true } },
      },
    });

    if (!shipment || shipment.storeId !== storeId) {
      return NextResponse.json(
        { success: false, error: "Shipment not found" },
        { status: 404 }
      );
    }

    if (
      TERMINAL_SHIPMENT_STATUSES.includes(
        shipment.status as (typeof TERMINAL_SHIPMENT_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Shipment is already in a terminal state" },
        { status: 409 }
      );
    }

    const settings = await prisma.storeDeliverySettings.findUnique({
      where: { storeId },
    });

    if (!settings?.isEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: "Delivery feature is not enabled for this store.",
        },
        { status: 400 }
      );
    }

    if (!settings.pickupAddressLine1) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Store pickup address is missing. Please configure it in Delivery Settings.",
        },
        { status: 400 }
      );
    }

    const provider = getDeliveryProvider(settings.provider);

    const dispatchData = {
      id: shipment.orderId,
      recipientName: shipment.recipientName || "Customer",
      recipientPhone: shipment.recipientPhone || "",
      addressLine1: shipment.addressLine1 || "",
      addressCity: shipment.addressCity || "",
      parcelDescription: `Order #${shipment.order?.orderNumber || shipment.order?.refCode || shipment.orderId}`,
    };

    const pickupSettings = {
      pickupName: settings.pickupName ?? undefined,
      pickupPhone: settings.pickupPhone ?? undefined,
      pickupAddressLine1: settings.pickupAddressLine1 ?? undefined,
      pickupCity: settings.pickupCity ?? undefined,
    };

    const result = (await provider.dispatch(dispatchData, pickupSettings)) as {
      success?: boolean;
      error?: string;
      providerJobId?: string;
      trackingUrl?: string | null;
      rawResponse?: unknown;
    };

    if (!result?.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Retry dispatch failed: ${result?.error || "Unknown error"}`,
        },
        { status: 502 }
      );
    }

    const updated = await prisma.shipment.update({
      where: { id: shipment.id, storeId },
      data: {
        provider: settings.provider,
        status: "CREATED",
        trackingCode: result.providerJobId || shipment.trackingCode,
        trackingUrl: result.trackingUrl ?? shipment.trackingUrl,
        notes: result.rawResponse ? JSON.stringify(result.rawResponse) : shipment.notes,
      },
    });

    try {
      await prisma.deliveryEvent.create({
        data: {
          shipmentId: shipment.id,
          status: "PENDING",
          note: `Retry dispatched via ${settings.provider}`,
          providerStatus: "REQUESTED",
        },
      });
    } catch {
      /* shipment event record update is non-critical */
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/fulfillment/shipments/:id/retry",
      operation: "POST",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
