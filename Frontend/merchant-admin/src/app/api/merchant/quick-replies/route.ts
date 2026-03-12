import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { logger } from "@/lib/logger";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

interface QuickReply {
  id: string;
  shortcut: string;
  message: string;
  category?: string;
}

interface StoreSettings {
  quickReplies?: QuickReply[];
  [key: string]: unknown;
}

export const GET = withVayvaAPI(PERMISSIONS.SUPPORT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { settings: true },
        });

        const settings = (store?.settings as StoreSettings | null) ?? {};
        const quickReplies = Array.isArray(settings.quickReplies) ? settings.quickReplies : [];

        return NextResponse.json({ quickReplies }, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[QUICK_REPLIES_GET] Failed to fetch quick replies", { storeId, error: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.SUPPORT_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json();
        const { shortcut, message, category } = body;

        if (!shortcut || !message) {
            return NextResponse.json({ error: "Shortcut and message are required" }, { status: 400 });
        }

        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { settings: true },
        });

        const settings = (store?.settings as StoreSettings | null) ?? {};
        const quickReplies = Array.isArray(settings.quickReplies) ? settings.quickReplies : [];

        const newReply: QuickReply = {
            id: `qr_${Date.now()}`,
            shortcut,
            message,
            category: category || "general",
        };

        await prisma.store?.update({
            where: { id: storeId },
            data: {
                settings: {
                    ...settings,
                    quickReplies: [...quickReplies, newReply],
                } as any,
            },
        });

        return NextResponse.json({ success: true, quickReply: newReply });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[QUICK_REPLIES_POST] Failed to create quick reply", { storeId, error: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
