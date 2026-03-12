import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { logger } from "@/lib/logger";
import { PERMISSIONS } from "@/lib/team/permissions";
import { sanitizeHTML } from "@/lib/sanitization";
import { z } from "zod";

const SettingsSchema = z.object({
    name: z.string().min(1).optional(),
    supportEmail: z.string().email().optional(),
    businessCategory: z.string().optional(),
});

interface StoreSettings {
  supportEmail?: string;
  [key: string]: unknown;
}

export const GET = withVayvaAPI(PERMISSIONS.ACCOUNT_VIEW, async (req: NextRequest, { storeId, correlationId }: { storeId: string; correlationId: string }) => {
    try {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: {
                name: true,
                category: true,
                settings: true,
            },
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found", correlationId }, { status: 404 });
        }

        const settings = (store.settings as StoreSettings | null) ?? {};

        return NextResponse.json({
            name: store.name,
            supportEmail: settings.supportEmail || "",
            businessCategory: store.category,
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[SETTINGS_GET] Failed to fetch settings", { storeId, correlationId, error: err.message });
        return NextResponse.json({ error: "Internal server error", correlationId }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.ACCOUNT_MANAGE, async (req: NextRequest, { storeId, correlationId }: { storeId: string; correlationId: string }) => {
    try {
        const body = await req.json();
        const parsed = SettingsSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input", correlationId }, { status: 400 });
        }
        const data = parsed.data;
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { settings: true },
        });
        const currentSettings = (store?.settings as StoreSettings | null) ?? {};
        await prisma.store.update({
            where: { id: storeId },
            data: {
                ...(data.name && { name: sanitizeHTML(data.name) }),
                ...(data.businessCategory && { category: sanitizeHTML(data.businessCategory || "") }),
                settings: {
                    ...currentSettings,
                    ...(data.supportEmail && { supportEmail: data.supportEmail }),
                }
            }
        });
        return NextResponse.json({ success: true });
    }
    catch (error) {
        logger.error("[SETTINGS_POST] Failed to update settings", { storeId, correlationId, error });
        return NextResponse.json({ error: "Internal server error", correlationId }, { status: 500 });
    }
});
