import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.STOREFRONT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { isLive: true, updatedAt: true },
        });

        const isLive = Boolean(store?.isLive);
        return NextResponse.json({
            status: isLive ? "live" : "draft",
            reasons: [],
            updated_at: (store?.updatedAt || new Date()).toISOString(),
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[STOREFRONT_STATUS_GET] Failed to fetch storefront status", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
