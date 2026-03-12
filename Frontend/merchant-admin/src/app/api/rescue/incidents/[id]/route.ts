import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.SUPPORT_VIEW, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
        
        // Fetch incident from DB
        const incident = await prisma.rescueIncident?.findFirst({
            where: { id, storeId },
        });

        if (!incident) {
            return NextResponse.json({ error: "Incident not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: incident }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const { id } = await params;
        logger.error("[RESCUE_INCIDENT_GET] Failed to fetch incident", { storeId, id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
