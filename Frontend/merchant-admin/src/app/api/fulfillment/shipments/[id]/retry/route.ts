import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";
import { getDeliveryProvider } from "@/lib/delivery/DeliveryProvider";

export const dynamic = "force-dynamic";

export const POST = withVayvaAPI(PERMISSIONS.FULFILLMENT_MANAGE, async (_req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id: shipmentId } = await params;

        const shipment = await prisma.shipment?.findUnique({
            where: { id: shipmentId },
            include: {
                order: { select: { id: true, orderNumber: true, refCode: true } },
            },
        });

        if (!shipment || shipment.storeId !== storeId) {
            return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
        }

        if (["DELIVERED", "CANCELED"].includes((shipment as any).status)) {
            return NextResponse.json({ success: false, error: "Shipment is already in a terminal state" }, { status: 409 });
        }

        const settings = await prisma.storeDeliverySettings?.findUnique({
            where: { storeId },
        });

        if (!settings?.isEnabled) {
            return NextResponse.json({ success: false, error: "Delivery feature is not enabled for this store." }, { status: 400 });
        }

        if (!settings.pickupAddressLine1) {
            return NextResponse.json({ success: false, error: "Store pickup address is missing. Please configure it in Delivery Settings." }, { status: 400 });
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

        const result = await provider.dispatch(dispatchData, settings as any) as { success?: boolean; error?: string; providerJobId?: string; trackingUrl?: string; rawResponse?: unknown };
        if (!result?.success) {
            return NextResponse.json({ success: false, error: `Retry dispatch failed: ${result?.error || "Unknown error"}` }, { status: 502 });
        }

        const updated = await prisma.shipment?.update({
            where: { id: shipment.id },
            data: {
                provider: settings.provider,
                status: "CREATED",
                trackingCode: result.providerJobId || shipment.trackingCode,
                trackingUrl: result.trackingUrl ?? shipment.trackingUrl,
                notes: result.rawResponse ? JSON.stringify(result.rawResponse) : shipment.notes,
            },
        });

        try {
            await prisma.deliveryEvent?.create({
                data: {
                    shipmentId: shipment.id,
                    status: "PENDING",
                    note: `Retry dispatched via ${settings.provider}`,
                    providerStatus: "REQUESTED",
                },
            });
        } catch { /* shipment event record update is non-critical */ }

        return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
