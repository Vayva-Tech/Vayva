import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { MerchantRescueService } from "@/lib/rescue/merchant-rescue-service";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.SUPPORT_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { route, errorMessage, stackHash, fingerprint } = body;
        if (!errorMessage) {
            return NextResponse.json({ error: "No error message" }, { status: 400 });
        }
        const incident = await MerchantRescueService.reportIncident({
            route: route || "unknown",
            errorMessage,
            stackHash,
            fingerprint,
            storeId,
            userId: user.id,
        });
        return NextResponse.json({
            incidentId: incident.id,
            status: (incident as any).status,
            message: "Rescue initiated"
        });
    }
    catch (error: unknown) {
        logger.error("[RESCUE_REPORT_POST] Failed to report incident", { storeId, error });
        return NextResponse.json({ error: "Failed to report" }, { status: 500 });
    }
});
