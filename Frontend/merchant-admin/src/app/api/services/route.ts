import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { BookingService } from "@/services/BookingService";
// Create new Service (Product)
export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (request: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const data = await request.json();
        const product = await BookingService.createServiceProduct(storeId, data);
        return NextResponse.json(product);
    }
    catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
});
