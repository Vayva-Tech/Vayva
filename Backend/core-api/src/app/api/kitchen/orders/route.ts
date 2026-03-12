import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { KitchenService } from "@/services/KitchenService";
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId }) => {
    try {
      const orders = await KitchenService.getOrders(storeId);
      return NextResponse.json(orders, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch kitchen orders" },
        { status: 500 },
      );
    }
  },
);
