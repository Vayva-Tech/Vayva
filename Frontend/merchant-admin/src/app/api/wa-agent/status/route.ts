import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { WhatsAppAgentService } from "@/services/whatsapp-agent.service";
import { FEATURES } from "@/lib/env-validation";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, async (req: NextRequest, { storeId, correlationId }: { storeId: string; correlationId: string }) => {
    try {
        if (!FEATURES.WHATSAPP_ENABLED) {
            return NextResponse.json({
                connected: false,
                status: "DISABLED",
                phoneNumber: null,
                requestId: correlationId,
            }, { headers: standardHeaders(correlationId) });
        }

        const channel = await WhatsAppAgentService.getChannel(storeId);
        const connected = channel?.status === "CONNECTED";
        return NextResponse.json({
            connected,
            status: channel?.status || "DISCONNECTED",
            phoneNumber: channel?.displayPhoneNumber || null,
            requestId: correlationId,
        }, { headers: standardHeaders(correlationId) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[WA_AGENT_STATUS_GET]", { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined, requestId: correlationId, storeId });
        return NextResponse.json({ error: "Failed to fetch WhatsApp status", requestId: correlationId }, { status: 500, headers: standardHeaders(correlationId) });
    }
});
