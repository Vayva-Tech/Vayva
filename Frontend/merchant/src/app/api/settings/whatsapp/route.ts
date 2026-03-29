import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { getIntegrationHealth } from "@/lib/integration-health";
import { handleApiError } from "@/lib/api-error-handler";

export const POST = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const health = await getIntegrationHealth(storeId);
        const status = health["whatsapp"]?.status || "UNKNOWN";

        return NextResponse.json({ status });
    } catch (error: unknown) {
        handleApiError(
            error,
            {
                endpoint: "/settings/whatsapp",
                operation: "GET_WHATSAPP_STATUS",
                storeId,
            }
        );
        throw error;
    }
});
