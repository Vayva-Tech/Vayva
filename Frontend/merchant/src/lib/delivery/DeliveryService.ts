import { prisma, type Order, type Customer, type Shipment, type StoreDeliverySettings, type Store } from "@vayva/db";
import { getDeliveryProvider } from "./DeliveryProvider";

interface OrderWithStore extends Order {
  shipments?: Shipment[];
  customer?: Customer | null;
  store: Store & { deliverySettings: StoreDeliverySettings | null };
}

interface DispatchResult {
  success: boolean;
  status: string;
  reason?: string;
  shipment?: Shipment;
  providerJobId?: string;
  trackingUrl?: string;
}

// Helper to bypass strict typing issues with generated client temporarily
const db = prisma;
export class DeliveryService {
    /**
     * Checks if an order is ready for delivery dispatch based on settings and data.
     */
    static checkReadiness(order: OrderWithStore, settings: StoreDeliverySettings) {
        const blockers = [];
        if (!settings.isEnabled) {
            return { status: "DISABLED", blockers: ["Delivery Disabled"] };
        }
        if (!settings.pickupAddressLine1) {
            blockers.push("Store Pickup Address Missing");
        }
        if (settings.provider === "KWIK" && !process.env?.KWIK_API_KEY) {
            blockers.push("Kwik API Key Not Configured");
        }
        const recipientPhone = order.shipments?.[0]?.recipientPhone ||
            order.customerPhone ||
            order.customer?.phone;
        const addressLine1 = order.shipments?.[0]?.addressLine1;
        if (!recipientPhone)
            blockers.push("Recipient Phone Missing");
        if (!addressLine1 && !blockers.includes("Recipient Phone Missing")) {
            blockers.push("Delivery Address Missing");
        }
        if (blockers.length > 0) {
            if (blockers.includes("Store Pickup Address Missing"))
                return { status: "NOT_READY_PICKUP_MISSING", blockers };
            if (blockers.includes("Kwik API Key Not Configured"))
                return { status: "NOT_READY_PROVIDER_MISSING", blockers };
            return { status: "NOT_READY_ADDRESS_MISSING", blockers };
        }
        return { status: "PICKED_UP", blockers: [] };
    }

    static async autoDispatch(orderId: string, channel: string, idempotencyKey?: string): Promise<DispatchResult> {
        const order = await db.order?.findUnique({
            where: { id: orderId },
            include: {
                shipments: true,
                customer: true,
                store: { include: { deliverySettings: true } },
            },
        }) as OrderWithStore | null;
        
        if (!order || !order.store?.deliverySettings) {
            return {
                success: false,
                status: "SKIPPED",
                reason: "Order or Settings not found",
            };
        }
        const settings = order.store?.deliverySettings;
        if (!settings.autoDispatchEnabled) {
            return {
                success: false,
                status: "SKIPPED",
                reason: "Auto-Dispatch Disabled globally",
            };
        }
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
        if (order.shipments?.[0] &&
            ["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"].includes(order.shipments[0].status)) {
            return {
                success: true,
                status: "SKIPPED",
                reason: "Already Dispatched",
                shipment: order.shipments[0],
            };
        }
        const readiness = this.checkReadiness(order, settings);
        if ((readiness as any).status !== "READY") {
            return {
                success: false,
                status: "BLOCKED",
                reason: `Readiness Failed: ${readiness?.blockers?.join(", ")}`,
            };
        }
        if (settings.autoDispatchMode === "CONFIRM") {
            await db.shipment?.upsert({
                where: { orderId: order.id },
                create: {
                    storeId: order.storeId,
                    orderId: order.id,
                    provider: settings.provider,
                    status: status as any,
                    recipientName: order.shipments?.[0]?.recipientName || `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim() || "Customer",
                    recipientPhone: order.shipments?.[0]?.recipientPhone ||
                        order.customerPhone ||
                        order.customer?.phone ||
                        "",
                    addressLine1: order.shipments?.[0]?.addressLine1 || "",
                    addressCity: order.shipments?.[0]?.addressCity || "",
                },
                update: {},
            });
            return {
                success: true,
                status: "PENDING_CONFIRMATION",
                reason: "Awaiting Admin Confirmation",
            };
        }
        
        const provider = getDeliveryProvider(settings.provider);
        const dispatchData = {
            id: order.id,
            recipientName: order.shipments?.[0]?.recipientName || `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim() || "Customer",
            recipientPhone: order.shipments?.[0]?.recipientPhone ||
                order.customerPhone ||
                order.customer?.phone ||
                "",
            addressLine1: order.shipments?.[0]?.addressLine1 || "",
            addressCity: order.shipments?.[0]?.addressCity || "",
            parcelDescription: `Order #${order.orderNumber}`,
        };
        if (!dispatchData.addressLine1 || !dispatchData.recipientPhone) {
            return {
                success: false,
                status: "BLOCKED",
                reason: "Address/Phone missing at dispatch time",
            };
        }
        try {
            const result = await provider.dispatch(dispatchData, settings as any);
            if (!result.success) {
                return {
                    success: false,
                    status: "BLOCKED",
                    reason: `Provider Error: ${(result as { error?: string }).error}`,
                };
            }
            const rawResponse = (result as { rawResponse?: unknown }).rawResponse;
            const shipment = await db.shipment?.upsert({
                where: { orderId: order.id },
                create: {
                    storeId: order.storeId,
                    orderId: order.id,
                    provider: settings.provider,
                    status: "CREATED",
                    recipientPhone: dispatchData.recipientPhone,
                    addressLine1: dispatchData.addressLine1,
                    addressCity: dispatchData.addressCity,
                    trackingCode: result.providerJobId,
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
            return { success: true, status: "DISPATCHED", shipment };
        }
        catch (error) {
            return { success: false, status: "BLOCKED", reason: (error as Error).message };
        }
    }
}
