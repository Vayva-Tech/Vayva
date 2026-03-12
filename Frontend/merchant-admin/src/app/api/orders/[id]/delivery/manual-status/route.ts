import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

type ShipmentStatus = "REQUESTED" | "ACCEPTED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED" | "CANCELED";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    REQUESTED: ["ACCEPTED", "CANCELED"],
    ACCEPTED: ["PICKED_UP", "CANCELED"],
    PICKED_UP: ["IN_TRANSIT", "FAILED"],
    IN_TRANSIT: ["DELIVERED", "FAILED"],
};

export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, params: rawParams }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const params = await Promise.resolve(rawParams);
        const { id: orderId } = params;
        const body = await req.json().catch(() => ({})) as {
            status?: string;
            note?: string;
            courierName?: string;
            courierPhone?: string;
            trackingUrl?: string;
        };

        const { status: toStatus, note, courierName, courierPhone, trackingUrl } = body;
        if (!toStatus) {
            return NextResponse.json({ success: false, error: "Missing status" }, { status: 400 });
        }

        // 1. Get Shipment
        const shipment = await prisma.shipment?.findUnique({
            where: { orderId },
        });

        if (!shipment || shipment.storeId !== storeId) {
            return NextResponse.json({ success: false, error: "Delivery job not found" }, { status: 404 });
        }

        // 2. Validate Provider
        if (shipment.provider !== "CUSTOM") {
            return NextResponse.json({ success: false, error: "Manual status updates are only allowed for Custom Courier." }, { status: 400 });
        }

        // 3. Validate Transition
        const currentStatus = (shipment as any).status;
        const allowed = ALLOWED_TRANSITIONS[currentStatus];
        
        if (!allowed?.includes(toStatus)) {
            // Allow moving to CANCELED from any non-terminal state
            if (toStatus === "CANCELED" && !["DELIVERED", "FAILED"].includes(currentStatus)) {
                // OK
            }
            else {
                return NextResponse.json({
                    success: false,
                    error: `Invalid status transition from ${currentStatus} to ${toStatus}`,
                }, { status: 400 });
            }
        }

        // 4. Update
        const updated = await prisma.shipment?.update({
            where: { id: shipment.id },
            data: {
                status: toStatus as any,
                courierName: courierName ?? shipment.courierName,
                courierPhone: courierPhone ?? shipment.courierPhone,
                trackingUrl: trackingUrl ?? shipment.trackingUrl,
            },
        });

        // 5. Event
        try {
            await prisma.deliveryEvent?.create({
                data: {
                    shipmentId: shipment.id,
                    status: toStatus as any,
                    note: note || `Manual update to ${toStatus}`,
                },
            });
        }
        catch (_e: any) {
            // Ignore if model not fully ready
        }

        return NextResponse.json({ success: true, data: updated, shipment: updated });
    }
    catch (error) {
        logger.error("[MANUAL_STATUS_POST] Failed to update delivery status", { storeId, error });
        return NextResponse.json({ success: false, error: "Failed to update delivery status" }, { status: 500 });
    }
});
