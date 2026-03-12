import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";
import { getDeliveryProvider } from "@/lib/delivery/DeliveryProvider";
import { FEATURES } from "@/lib/env-validation";
import { z } from "zod";
import { logger } from "@/lib/logger";
// Helper to bypass stale client types if models/fields are missing in generated client
const db = prisma;
// Zod Schema
const DispatchSchema = z.object({
    recipientName: z.string().min(2, "Receiver name required"),
    recipientPhone: z.string().regex(/^[0-9+ ]{10,15}$/, "Invalid phone number"),
    addressLine1: z.string().min(5, "Valid street address required"),
    addressCity: z.string().min(2, "City required"),
});
export const POST = withVayvaAPI(PERMISSIONS.FULFILLMENT_MANAGE, async (request: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        // NOTE: Next.js Route Handlers with generic wrappers might pass context slightly differently
        // but assuming withRBAC standardizes insertion of session.
        // We need to parse params from context.
        // The third arg in withRBAC handler is the original remaining args.
        const { id: orderId } = await params;
        // 1. Feature Flag Check
        if (!FEATURES.DELIVERY_ENABLED) {
            return NextResponse.json({
                code: "feature_not_configured",
                feature: "DELIVERY_ENABLED",
                message: "Delivery is disabled.",
            }, { status: 503 });
        }
        // 2. Load Store Settings
        const settings = await db.storeDeliverySettings?.findUnique({
            where: { storeId },
        });
        if (!settings?.isEnabled) {
            return NextResponse.json({ success: false, error: "Delivery feature is not enabled for this store." }, { status: 400 });
        }
        if (!settings.pickupAddressLine1) {
            return NextResponse.json({
                success: false,
                error: "Store pickup address is missing. Please configure it in Delivery Settings.",
            }, { status: 400 });
        }
        // 3. Load Order with Shipment and Customer
        const order = await db.order?.findUnique({
            where: { id: orderId, storeId },
            include: {
                shipments: true,
                customer: true,
            },
        });
        if (!order)
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        // Check if shipment is in terminal state
        const s = order.shipments?.[0];
        if (s) {
            const status = (s as any).status;
            if (["DELIVERED", "CANCELED", "FAILED"].includes(status)) {
                return NextResponse.json({ success: false, error: "Delivery is already finished (Terminal State)." }, { status: 409 });
            }
            if (["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(status)) {
                return NextResponse.json({ success: true, data: s, shipment: s });
            }
        }

        let body: Record<string, unknown> | null = null;
        try {
            body = await request.json();
        }
        catch (_e: any) {
            body = null;
        }

        const shippingAddress = ((order.metadata as Record<string, unknown>)?.shippingAddress || {}) as Record<string, string>;

        // 4. Prepare Dispatch Data
        const recipientName = (
            [
                typeof body?.recipientName === "string" ? body.recipientName : undefined,
                s?.recipientName || undefined,
                shippingAddress.recipientName,
                shippingAddress.name,
                `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim(),
            ].find((v): v is string => typeof v === "string" && v.trim().length > 0) || "Customer"
        );

        const recipientPhone = (
            [
                typeof body?.recipientPhone === "string" ? body.recipientPhone : undefined,
                s?.recipientPhone || undefined,
                shippingAddress.phone,
                shippingAddress.recipientPhone,
                order.customerPhone || undefined,
                order.customer?.phone || undefined,
            ].find((v): v is string => typeof v === "string" && v.trim().length > 0) || ""
        );

        const addressLine1 = (
            [
                typeof body?.addressLine1 === "string" ? body.addressLine1 : undefined,
                s?.addressLine1 || undefined,
                shippingAddress.addressLine1,
                shippingAddress.line1,
                shippingAddress.street,
            ].find((v): v is string => typeof v === "string" && v.trim().length > 0) || ""
        );

        const addressCity = (
            [
                typeof body?.addressCity === "string" ? body.addressCity : undefined,
                s?.addressCity || undefined,
                shippingAddress.city,
            ].find((v): v is string => typeof v === "string" && v.trim().length > 0) || ""
        );
        // Kwik Validation
        if (settings.provider === "KWIK") {
            if (!recipientPhone || !addressLine1) {
                return NextResponse.json({
                    success: false,
                    error: "Missing recipient phone or address required for Kwik dispatch.",
                }, { status: 400 });
            }
        }
        // ZOD VALIDATION
        const validation = DispatchSchema.safeParse({
            recipientName,
            recipientPhone,
            addressLine1,
            addressCity
        });
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                error: "Validation Failed",
                details: validation.error?.flatten().fieldErrors
            }, { status: 400 });
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
        }
        catch (e: any) {
            return NextResponse.json({ success: false, error: `Invalid delivery provider configured: ${settings.provider}` }, { status: 400 });
        }
        const result = await provider.dispatch(dispatchData, settings as any) as { success?: boolean; error?: string; providerJobId?: string; trackingUrl?: string; rawResponse?: unknown };
        if (!result.success) {
            return NextResponse.json({ success: false, error: `Dispatch Failed: ${result.error}` }, { status: 502 });
        }
        // 6. Upsert Shipment
        const toStatus = "CREATED";
        const shipment = await db.shipment?.upsert({
            where: { orderId },
            create: {
                storeId,
                orderId,
                provider: settings.provider,
                status: toStatus,
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
                status: toStatus,
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
                await db.deliveryEvent?.create({
                    data: {
                        shipmentId: shipment.id,
                        status: toStatus as any,
                        note: `Dispatched via ${settings.provider} (Job: ${result.providerJobId})`,
                        providerStatus: "REQUESTED",
                    },
                });
            }
        }
        catch (e) {
            logger.warn("[ORDER_DISPATCH] Failed to create delivery event log", { error: e });
        }
        return NextResponse.json({ success: true, data: shipment, shipment });
    }
    catch (error) {
        logger.error("[ORDER_DISPATCH] Dispatch failed", { storeId, error });
        return NextResponse.json({ success: false, error: "Dispatch failed" }, { status: 500 });
    }
});
