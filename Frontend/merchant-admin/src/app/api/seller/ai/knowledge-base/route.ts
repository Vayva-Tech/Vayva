import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

export const GET = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const entries = await prisma.knowledgeBaseEntry?.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ data: entries }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error: unknown) {
        logger.error("[KB_ENTRIES_GET] Failed to fetch knowledge base entries", { storeId, error });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
