import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.ACCOUNT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { industrySlug: true },
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const industrySlug = store.industrySlug as IndustrySlug | null;
        const config = industrySlug ? INDUSTRY_CONFIG[industrySlug] : null;

        return NextResponse.json({
            industrySlug,
            config: config ? {
                displayName: config.displayName,
                primaryObject: config.primaryObject,
                modules: config.modules,
                moduleLabels: config.moduleLabels,
            } : null,
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[SETTINGS_INDUSTRY_GET] Failed to fetch industry settings", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { 
            status: 500,
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.ACCOUNT_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { industrySlug } = body;

        // Validate industry slug
        if (!industrySlug || !INDUSTRY_CONFIG[industrySlug as IndustrySlug]) {
            return NextResponse.json({ error: "Invalid industry slug" }, { status: 400 });
        }

        // Update store
        const updatedStore = await prisma.store?.update({
            where: { id: storeId },
            data: { industrySlug },
            select: { id: true, industrySlug: true },
        });

        const config = INDUSTRY_CONFIG[industrySlug as IndustrySlug];

        return NextResponse.json({
            success: true,
            industrySlug: updatedStore.industrySlug,
            config: {
                displayName: config.displayName,
                primaryObject: config.primaryObject,
                modules: config.modules,
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[SETTINGS_INDUSTRY_POST] Failed to update industry settings", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
