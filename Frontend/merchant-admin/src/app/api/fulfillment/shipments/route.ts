import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(PERMISSIONS.FULFILLMENT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get("status");
        const isIssue = searchParams.get("issue") === "true";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = { storeId };
        if (isIssue) {where.status = { in: ["FAILED", "EXCEPTION", "RETURNED", "RETURN_REQUESTED"] };
        }
        else if (statusFilter && statusFilter !== "ALL") {where.status = statusFilter;
        }
        const shipments = await prisma.shipment?.findMany({
            where,
            include: {
                order: {
                    select: { orderNumber: true, customerId: true }
                }
            },
            orderBy: { updatedAt: "desc" },
            take: 50
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = shipments.map((shipment: any) => ({
            id: shipment.id,
            orderId: shipment.orderId,
            orderNumber: shipment.order?.orderNumber || "Unknown",
            status: (shipment as any).status,
            provider: shipment.provider,
            trackingCode: shipment.trackingCode,
            trackingUrl: shipment.trackingUrl,
            courierName: shipment.courierName,
            recipientName: shipment.recipientName,
            updatedAt: shipment.updatedAt,
        }));
        return NextResponse.json({ success: true, data: formatted }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[FULFILLMENT_SHIPMENTS_GET] Failed to fetch shipments", { storeId, error });
        return NextResponse.json({ success: false, error: "Failed to fetch shipments" }, { status: 500 });
    }
});
