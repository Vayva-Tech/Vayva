import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { getIntegrationHealth } from "@/lib/integration-health";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const health = await getIntegrationHealth(storeId);
        const status = health["whatsapp"]?.status || "UNKNOWN";

        return NextResponse.json({ status });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[SETTINGS_WHATSAPP_POST] Failed to fetch WhatsApp status", { storeId, error });
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
});
