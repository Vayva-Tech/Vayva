import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
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
  } catch (error) {
    handleApiError(error, { endpoint: "/api/fulfillment/shipments", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
