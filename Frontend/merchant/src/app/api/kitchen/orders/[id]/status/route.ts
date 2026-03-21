import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await request.json().catch(() => ({}));
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    const order = await prisma.order?.update({
      where: { id, storeId },
      data: {
        fulfillmentStatus: status
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/kitchen/orders/[id]/status",
      operation: "UPDATE_ORDER_STATUS",
    });
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
