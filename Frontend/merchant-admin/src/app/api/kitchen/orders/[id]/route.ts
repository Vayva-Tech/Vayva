import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { KitchenService } from "@/services/KitchenService";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PUT = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (request: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const { id } = await params;
        const { status } = await request.json();
        const updatedOrder = await KitchenService.updateOrderStatus(id, status);
        return NextResponse.json(updatedOrder);
    }
    catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
});
