import { prisma, DispatchJobStatus as _DispatchJobStatus } from "@vayva/db";
import { getDeliveryProvider } from "./DeliveryProvider";
// Helper to bypass strict typing issues with generated client temporarily
const db = prisma;
export class DeliveryService {
  /**
   * Checks if an order is ready for delivery dispatch based on settings and data.
   */
  static checkReadiness(
    order: {
      shipments?: Array<{
        addressLine1?: string | null;
        recipientPhone?: string | null;
      }>;
      customer?: {
        defaultAddressId?: string | null;
        phone?: string | null;
        lastName?: string | null;
      } | null;
      shippingAddress?: string;
      customerPhone?: string | null;
    },
    settings: {
      isEnabled?: boolean;
      pickupAddressLine1?: string | null;
      provider?: string;
    },
  ) {
    const blockers = [];
    if (!settings.isEnabled) {
      return { status: "DISABLED", blockers: ["Delivery Disabled"] };
    }
    if (!settings.pickupAddressLine1) {
      blockers.push("Store Pickup Address Missing");
    }
    if (settings.provider === "KWIK" && !process.env.KWIK_API_KEY) {
      blockers.push("Kwik API Key Not Configured");
    }
    // Check Order Address Presence (Naive check for now)
    // We look at shipment snapshot first, then Order/customer fallback
    const _hasAddress =
      order.shipments?.[0]?.addressLine1 ||
      order.customer?.defaultAddressId || // Weak check, but assume address exists if ID exists? Better to check fields if visible.
      order.shippingAddress || // Future proofing
      ((order.customer?.phone || order.customerPhone) &&
        order.customer?.lastName); // Bare minimum?
    // Actually, let's be strict. We need AT LEAST a phone and a line 1.
    // Since we don't have strictly typed Address object on Order yet (Stage 1.2 note),
    // we check the best available sources.
    const recipientPhone =
      order.shipments?.[0]?.recipientPhone ||
      order.customerPhone ||
      order.customer?.phone;
    const addressLine1 = order.shipments?.[0]?.addressLine1; // If shipment doesn't exist, we rely on having created it or Order having address fields.
    // If no shipment exists yet, we can't be sure of address unless it's on Order.
    // For Stage 3, we assume triggers might create the shipment or Order has fields.
    // Let's assume for readiness we need EITHER an existing shipment with address OR we can derive it.
    if (!recipientPhone) blockers.push("Recipient Phone Missing");
    // If we don't have a shipment, and we don't have address fields on Order (which we don't in schema yet explicitly except via relations),
    // we might rely on 'deliveryReady' flag or similar.
    // For this implementation, we will assume if shipment is missing, we are NOT ready,
    // UNLESS it comes from a channel that guarantees address (like Storefront).
    if (!addressLine1 && !blockers.includes("Recipient Phone Missing")) {
      // Don't double report if we are just missing everything
      // Relaxed check: Custom courier might not need it? No, we said "Never dispatch without address".
      blockers.push("Delivery Address Missing");
    }
    if (blockers.length > 0) {
      if (blockers.includes("Store Pickup Address Missing"))
        return { status: "NOT_READY_PICKUP_MISSING", blockers };
      if (blockers.includes("Kwik API Key Not Configured"))
        return { status: "NOT_READY_PROVIDER_MISSING", blockers };
      return { status: "NOT_READY_ADDRESS_MISSING", blockers };
    }
    return { status: "READY", blockers: [] };
  }
  /**
   * Attempt to Auto-Dispatch an order.
   * Enforces Idempotency and Settings.
   */
  static async autoDispatch(
    orderId: string,
    channel: string,
    _idempotencyKey?: string,
  ) {
    // 1. Fetch Context
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        shipments: true,
        customer: true,
        store: { include: { deliverySettings: true } },
      },
    });
    if (!order || !order.store.deliverySettings) {
      return {
        success: false,
        status: "SKIPPED",
        reason: "Order or Settings not found",
      };
    }
    const settings = order.store.deliverySettings;
    // 2. Check Global Auto-Dispatch Enablement
    if (!settings.autoDispatchEnabled) {
      return {
        success: false,
        status: "SKIPPED",
        reason: "Auto-Dispatch Disabled globally",
      };
    }
    // 3. Check Channel Enablement
    if (channel === "whatsapp" && !settings.autoDispatchWhatsapp) {
      return {
        success: false,
        status: "SKIPPED",
        reason: "Auto-Dispatch Disabled for WhatsApp",
      };
    }
    if (channel === "storefront" && !settings.autoDispatchStorefront) {
      return {
        success: false,
        status: "SKIPPED",
        reason: "Auto-Dispatch Disabled for Storefront",
      };
    }
    // 4. Idempotency Check (Check if shipment already exists and is not DRAFT/CREATED by this process)
    // If shipment exists and is > REQUESTED, we skip.
    if (
      order.shipments?.[0] &&
      [
        "REQUESTED",
        "ACCEPTED",
        "PICKED_UP",
        "IN_TRANSIT",
        "DELIVERED",
      ].includes(order.shipments[0].status)
    ) {
      return {
        success: true,
        status: "SKIPPED",
        reason: "Already Dispatched",
        shipment: order.shipments[0],
      };
    }
    // 5. Readiness Check
    const readiness = this.checkReadiness(order, settings);
    if (readiness.status !== "READY") {
      // Create blockers note or log?
      return {
        success: false,
        status: "BLOCKED",
        reason: `Readiness Failed: ${readiness.blockers.join(", ")}`,
      };
    }
    // 6. Mode Check
    if (settings.autoDispatchMode === "CONFIRM") {
      // "Pending Confirmation" flow.
      // Create DRAFT shipment to signal "Pending Confirmation" state
      await db.shipment.upsert({
        where: { orderId: order.id },
        create: {
          storeId: order.storeId,
          orderId: order.id,
          provider: settings.provider,
          status: "CREATED" as const,
          recipientName:
            order.shipments?.[0]?.recipientName ||
            `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim() ||
            "Customer",
          recipientPhone:
            order.shipments?.[0]?.recipientPhone ||
            order.customerPhone ||
            order.customer?.phone ||
            "",
          addressLine1: order.shipments?.[0]?.addressLine1 || "",
          addressCity: order.shipments?.[0]?.addressCity || "",
        },
        update: {
          // If exists, ensure it's at least visible, but don't overwrite user edits if any?
          // Safe to just ensure it exists.
        },
      });
      try {
        const { logAuditEvent: logAudit } = await import("@/lib/audit");
        await logAudit(
          order.storeId,
          "auto_dispatch",
          "DELIVERY_AUTO_DISPATCH_PENDING",
          {
            targetType: "ORDER",
            targetId: order.id,
            after: { mode: "CONFIRM", channel },
            meta: { actor: { type: "SYSTEM", label: "AutoDispatch" } },
          },
        );
      } catch {
        // Intentionally empty
      }
      return {
        success: true,
        status: "PENDING_CONFIRMATION",
        reason: "Awaiting Admin Confirmation",
      };
    }
    // 7. EXECUTE DISPATCH (AUTO MODE)
    // Using the API logic? Or calling Provider directly?
    // Better to reuse the route logic or extract it?
    // Extracting logic:
    const provider = getDeliveryProvider(settings.provider);
    const dispatchData = {
      id: order.id,
      recipientName:
        order.shipments?.[0]?.recipientName ||
        `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim() ||
        "Customer",
      recipientPhone:
        order.shipments?.[0]?.recipientPhone ||
        order.customerPhone ||
        order.customer?.phone ||
        "",
      addressLine1: order.shipments?.[0]?.addressLine1 || "", // We verified readiness, but actual value might need derivation
      addressCity: order.shipments?.[0]?.addressCity || "",
      parcelDescription: `Order #${order.orderNumber}`,
    };
    // Re-verify address existence for strict type safety
    if (!dispatchData.addressLine1 || !dispatchData.recipientPhone) {
      return {
        success: false,
        status: "BLOCKED",
        reason: "Address/Phone missing at dispatch time",
      };
    }
    try {
      const result = await provider.dispatch(dispatchData, settings);
      if (!result.success) {
        // Log failure but don't crash
        // Upsert shipment as FAILED or DRAFT with error?
        /* await prisma.shipment.upsert({ ... status: 'FAILED' ... }) */
        const providerError = (result as { error?: unknown }).error
          ? String((result as { error?: unknown }).error)
          : "Unknown Provider Error";
        return {
          success: false,
          status: "BLOCKED",
          reason: `Provider Error: ${providerError}`,
        };
      }
      // Success! Upsert shipment
      const rawResponse = (result as { rawResponse?: unknown }).rawResponse;
      const shipment = await db.shipment.upsert({
        where: { orderId: order.id },
        create: {
          storeId: order.storeId,
          orderId: order.id,
          provider: settings.provider,
          status: "CREATED",
          recipientPhone: dispatchData.recipientPhone,
          addressLine1: dispatchData.addressLine1,
          addressCity: dispatchData.addressCity,
          trackingCode: result.providerJobId, // Using trackingCode as primary ID
          trackingUrl: result.trackingUrl,
          notes: rawResponse ? JSON.stringify(rawResponse) : undefined,
        },
        update: {
          provider: settings.provider,
          status: "CREATED",
          trackingCode: result.providerJobId,
          trackingUrl: result.trackingUrl,
          notes: rawResponse ? JSON.stringify(rawResponse) : undefined,
        },
      });
      try {
        const { logAuditEvent: logAudit } = await import("@/lib/audit");
        await logAudit(
          order.storeId,
          "auto_dispatch",
          "DELIVERY_AUTO_DISPATCH_ATTEMPTED",
          {
            targetType: "SHIPMENT",
            targetId: shipment.id,
            after: {
              channel,
              status: "CREATED",
              mode: settings.autoDispatchMode,
              trackingUrl: result.trackingUrl,
            },
            meta: { actor: { type: "SYSTEM", label: "AutoDispatch" } },
          },
        );
      } catch {
        /* non-blocking */
      }
      return { success: true, status: "DISPATCHED", shipment };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown Error";
      return { success: false, status: "BLOCKED", reason: message };
    }
  }
}
