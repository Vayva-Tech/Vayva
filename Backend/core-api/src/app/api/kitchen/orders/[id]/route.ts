import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { KitchenService } from "@/services/KitchenService";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const PUT = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id } = await params;
      const body: unknown = await request.json().catch(() => ({}));
      const status = isRecord(body) ? body.status : undefined;
      const updatedOrder = await KitchenService.updateStatus(
        id,
        status,
        storeId,
      );
      return NextResponse.json(updatedOrder);
    } catch (error: unknown) {
      logger.error("[KITCHEN_ORDER_PUT]", error, { storeId });
      const message = error instanceof Error ? error.message : "Internal Error";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },
);
