import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { getDeliveryProvider } from "@/lib/delivery/DeliveryProvider";
import { FEATURES } from "@/lib/env-validation";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";
// Helper to bypass stale client types if models/fields are missing in generated client
const db = prisma;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// Zod Schema
const DispatchSchema = z.object({
  recipientName: z.string().min(2, "Receiver name required"),
  recipientPhone: z.string().regex(/^[0-9+ ]{10,15}$/, "Invalid phone number"),
  addressLine1: z.string().min(5, "Valid street address required"),
  addressCity: z.string().min(2, "City required"),
});
export const POST = withVayvaAPI(
  PERMISSIONS.FULFILLMENT_MANAGE,
  async (request, { storeId, params }) => {
    try {
      // NOTE: Next.js Route Handlers with generic wrappers might pass context slightly differently
      // but assuming withRBAC standardizes insertion of session.
      // We need to parse params from context.
      // The third arg in withRBAC handler is the original remaining args.
      const { id: orderId } = await params;
      // 1. Feature Flag Check
      if (!FEATURES.DELIVERY_ENABLED) {
        return NextResponse.json(
          {
            code: "feature_not_configured",
            feature: "DELIVERY_ENABLED",
            message: "Delivery is disabled.",
          },
          { status: 503 },
        );
      }
      // 2. Load Store Settings
      const settings = await db.storeDeliverySettings.findUnique({
        where: { storeId },
      });
      if (!settings?.isEnabled) {
        return NextResponse.json(
          {
            success: false,
            error: "Delivery feature is not enabled for this store.",
          },
          { status: 400 },
        );
      }
      if (!settings.pickupAddressLine1) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Store pickup address is missing. Please configure it in Delivery Settings.",
          },
          { status: 400 },
        );
      }
      // 3. Load Order with Shipment and Customer
      const order = await db.order.findUnique({
        where: { id: orderId, storeId },
        include: {
          shipments: true,
          customer: true,
        },
      });
      if (!order)
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 },
        );
      // Check if shipment is in terminal state
      const s = order.shipments?.[0];
      if (s) {
        const status = s.status;
        if (["DELIVERED", "CANCELED", "FAILED"].includes(status)) {
          return NextResponse.json(
            {
              success: false,
              error: "Delivery is already finished (Terminal State).",
            },
            { status: 409 },
          );
        }
        if (
          ["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(status)
        ) {
          return NextResponse.json({ success: true, data: s, shipment: s });
        }
      }

      const body = getObject(await request.json().catch(() => ({})));
      const orderMetadata = getObject(order.metadata);
      const shippingAddress = getObject(orderMetadata.shippingAddress);

      // 4. Prepare Dispatch Data
      const recipientName =
        [
          typeof body.recipientName === "string"
            ? body.recipientName
            : undefined,
          s?.recipientName || undefined,
          getString(shippingAddress.recipientName),
          getString(shippingAddress.name),
          `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim(),
        ].find(
          (v): v is string => typeof v === "string" && v.trim().length > 0,
        ) || "Customer";

      const recipientPhone =
        [
          typeof body.recipientPhone === "string"
            ? body.recipientPhone
            : undefined,
          s?.recipientPhone || undefined,
          getString(shippingAddress.phone),
          getString(shippingAddress.recipientPhone),
          order.customerPhone || undefined,
          order.customer?.phone || undefined,
        ].find(
          (v): v is string => typeof v === "string" && v.trim().length > 0,
        ) || "";

      const addressLine1 =
        [
          typeof body.addressLine1 === "string"
            ? body.addressLine1
            : undefined,
          s?.addressLine1 || undefined,
          getString(shippingAddress.addressLine1),
          getString(shippingAddress.line1),
          getString(shippingAddress.street),
        ].find(
          (v): v is string => typeof v === "string" && v.trim().length > 0,
        ) || "";

      const addressCity =
        [
          typeof body.addressCity === "string" ? body.addressCity : undefined,
          s?.addressCity || undefined,
          getString(shippingAddress.city),
        ].find(
          (v): v is string => typeof v === "string" && v.trim().length > 0,
        ) || "";
      // Kwik Validation
      if (settings.provider === "KWIK") {
        if (!recipientPhone || !addressLine1) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Missing recipient phone or address required for Kwik dispatch.",
            },
            { status: 400 },
          );
        }
      }
      // ZOD VALIDATION
      const validation = DispatchSchema.safeParse({
        recipientName,
        recipientPhone,
        addressLine1,
        addressCity,
      });
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation Failed",
            details: validation.error.flatten().fieldErrors,
          },
          { status: 400 },
        );
      }
      const dispatchData = {
        id: orderId,
        recipientName,
        recipientPhone,
        addressLine1,
        addressCity,
        parcelDescription: `Order #${order.orderNumber || order.refCode}`,
      };
      // 5. Get Provider and Dispatch
      let provider;
      try {
        provider = getDeliveryProvider(settings.provider);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid delivery provider configured: ${settings.provider}`,
          },
          { status: 400 },
        );
      }
      const result = (await provider.dispatch(dispatchData, settings)) as {
        success?: boolean;
        error?: string;
        providerJobId?: string;
        trackingUrl?: string;
        rawResponse?: unknown;
      };
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: `Dispatch Failed: ${result.error}` },
          { status: 502 },
        );
      }
      // 6. Upsert Shipment
      const shipment = await db.shipment.upsert({
        where: { orderId },
        create: {
          storeId,
          orderId,
          provider: settings.provider,
          status: "CREATED",
          recipientName,
          recipientPhone,
          addressLine1,
          addressCity,
          trackingCode: result.providerJobId,
          trackingUrl: result.trackingUrl,
          notes: result.rawResponse
            ? JSON.stringify(result.rawResponse)
            : undefined,
        },
        update: {
          provider: settings.provider,
          status: "CREATED",
          trackingCode: result.providerJobId,
          trackingUrl: result.trackingUrl,
          notes: result.rawResponse
            ? JSON.stringify(result.rawResponse)
            : undefined,
        },
      });
      // 7. Log Event
      try {
        if (db.deliveryEvent) {
          await db.deliveryEvent.create({
            data: {
              shipmentId: shipment.id,
              status: "PENDING",
              note: `Dispatched via ${settings.provider} (Job: ${result.providerJobId})`,
              providerStatus: "REQUESTED",
            },
          });
        }
      } catch (e) {
        logger.warn("[DELIVERY_EVENT_LOG_FAILED]", undefined, {
          storeId,
          orderId,
          error: e,
        });
      }
      return NextResponse.json({ success: true, data: shipment, shipment });
    } catch (error: unknown) {
      logger.error("[DELIVERY_DISPATCH_POST]", error, { storeId });
      return NextResponse.json(
        { success: false, error: "Dispatch failed" },
        { status: 500 },
      );
    }
  },
);
