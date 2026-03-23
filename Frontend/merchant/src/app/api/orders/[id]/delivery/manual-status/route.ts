// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const storeId = request.headers.get("x-store-id") || "";
        const body = await request.json().catch(() => ({})) as {
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

        // Call backend API to update delivery status
        const result = await apiJson<{
            success: boolean;
            data?: { id: string; status: string };
            shipment?: { id: string; status: string };
            error?: string;
        }>(
            `${process.env.BACKEND_API_URL}/api/orders/${orderId}/delivery/manual-status`,
      {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-store-id": storeId,
                },
                body: JSON.stringify({ status: toStatus, note, courierName, courierPhone, trackingUrl }),
            }
        );
        
        if (result.error) {
            const status = result.error.includes("not found") ? 404 : 
                          result.error.includes("only for Custom") ? 400 : 400;
            return NextResponse.json(result, { status });
        }

        return NextResponse.json({ success: true, data: result.data, shipment: result.shipment });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/orders/:id/delivery/manual-status", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
