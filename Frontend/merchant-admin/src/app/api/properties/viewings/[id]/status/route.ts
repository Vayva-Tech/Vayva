import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const PATCH = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
        const body = await req.json();
        const { status } = body; // CONFIRMED, CANCELLED
        if (!status)
            return NextResponse.json({ error: "Status required" }, { status: 400 });
        const booking = await prisma.booking?.update({
            where: { id, storeId },
            data: { status }
        });
        return NextResponse.json({ success: true, booking });
    }
    catch (e: any) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[PROPERTIES_VIEWINGS_ID_STATUS_PATCH] Failed to update viewing status", { storeId, id: resolvedParams.id, error: e });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
