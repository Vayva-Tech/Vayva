import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, DispatchJobStatus, DeliveryEventStatus } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isKeyOf<T extends object>(obj: T, key: PropertyKey): key is keyof T {
  return key in obj;
}

const ALLOWED_TRANSITIONS = {
  REQUESTED: ["ACCEPTED", "CANCELED"],
  ACCEPTED: ["PICKED_UP", "CANCELED"],
  PICKED_UP: ["IN_TRANSIT", "FAILED"],
  IN_TRANSIT: ["DELIVERED", "FAILED"],
};

export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, params }) => {
    const { id: orderId } = await params;
    try {
      const body: unknown = await req.json().catch(() => ({}));
      const bodyRecord = isRecord(body) ? body : {};

      const toStatus = getOptionalString(bodyRecord.status);
      const note = getOptionalString(bodyRecord.note);
      const courierName = getOptionalString(bodyRecord.courierName);
      const courierPhone = getOptionalString(bodyRecord.courierPhone);
      const trackingUrl = getOptionalString(bodyRecord.trackingUrl);

      if (!toStatus) {
        return NextResponse.json(
          { success: false, error: "Missing status" },
          { status: 400 },
        );
      }

      // 1. Get Shipment
      const shipment = await prisma.shipment.findUnique({
        where: { orderId }, // Shipment.orderId is unique
      });

      if (!shipment || shipment.storeId !== storeId) {
        return NextResponse.json(
          { success: false, error: "Delivery job not found" },
          { status: 404 },
        );
      }

      // 2. Validate Provider
      if (shipment.provider !== "CUSTOM") {
        return NextResponse.json(
          {
            success: false,
            error: "Manual status updates are only allowed for Custom Courier.",
          },
          { status: 400 },
        );
      }

      // 3. Validate Transition
      const currentStatus = shipment.status;
      const allowed = isKeyOf(ALLOWED_TRANSITIONS, currentStatus)
        ? ALLOWED_TRANSITIONS[currentStatus]
        : undefined;

      if (!allowed?.includes(toStatus)) {
        // Allow moving to CANCELED from any non-terminal state
        if (
          toStatus === "CANCELED" &&
          !["DELIVERED", "FAILED"].includes(currentStatus)
        ) {
          // OK
        } else {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid status transition from ${currentStatus} to ${toStatus}`,
            },
            { status: 400 },
          );
        }
      }

      // 4. Update
      const updated = await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: toStatus as DispatchJobStatus,
          courierName: courierName ?? shipment.courierName,
          courierPhone: courierPhone ?? shipment.courierPhone,
          trackingUrl: trackingUrl ?? shipment.trackingUrl,
        },
      });

      // 5. Event
      try {
        await prisma.deliveryEvent.create({
          data: {
            shipmentId: shipment.id,
            status: toStatus as DeliveryEventStatus,
            note: note || `Manual update to ${toStatus}`,
          },
        });
      } catch {
        // Ignore if model not fully ready
      }

      return NextResponse.json({
        success: true,
        data: updated,
        shipment: updated,
      });
    } catch (error: unknown) {
      logger.error("[MANUAL_STATUS_POST]", error, { storeId });
      return NextResponse.json(
        { success: false, error: "Failed to update delivery status" },
        { status: 500 },
      );
    }
  },
);
