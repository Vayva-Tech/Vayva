import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { MenuService } from "@/services/MenuService";
export const POST = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, async (request: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const data = await request.json();
        const product = await MenuService.createMenuItem(storeId, data);
        return NextResponse.json(product);
    }
    catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
});
