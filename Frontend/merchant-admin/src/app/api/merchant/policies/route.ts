import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(PERMISSIONS.STOREFRONT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const policies = await prisma.merchantPolicy?.findMany({
            where: { storeId },
            orderBy: { type: "asc" },
        });
        return NextResponse.json({ policies }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error: unknown) {
        logger.error("[MERCHANT_POLICIES_GET] Failed to fetch policies", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
