import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { logger } from "@/lib/logger";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

export const GET = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const settings = await prisma.whatsAppAgentSettings?.findUnique({
            where: { storeId },
        });
        return NextResponse.json({ success: true, data: settings }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error: unknown) {
        logger.error("[SELLER_AI_WHATSAPP_SETTINGS_GET] Failed to fetch WhatsApp settings", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch WhatsApp settings" }, { status: 500 });
    }
});

export const PUT = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const settings = await prisma.whatsAppAgentSettings?.upsert({
            where: { storeId },
            update: {
                ...body,
                updatedAt: new Date(),
            },
            create: {
                ...body,
                storeId,
            },
        });
        return NextResponse.json({ success: true, data: settings });
    }
    catch (error: unknown) {
        logger.error("[SELLER_AI_WHATSAPP_SETTINGS_PUT] Failed to update WhatsApp settings", { storeId, error });
        return NextResponse.json({ error: "Failed to update WhatsApp settings" }, { status: 500 });
    }
});
