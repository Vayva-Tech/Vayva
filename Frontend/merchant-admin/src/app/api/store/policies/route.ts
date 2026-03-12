import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.STOREFRONT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { settings: true },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settings: any = store?.settings || {};
        const policies = settings.policies || {
            refundPolicy: "",
            shippingPolicy: "",
            termsOfService: "",
            privacyPolicy: "",
        };
        return NextResponse.json(policies, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error: unknown) {
        logger.error("[STORE_POLICIES_GET] Failed to fetch policies", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.STOREFRONT_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json();
        // Fetch current settings to merge
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { settings: true },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentSettings: any = store?.settings || {};
        const updatedPolicies = { ...(currentSettings.policies || {}), ...body };
        const updatedSettings = {
            ...currentSettings,
            policies: updatedPolicies,
        };
        await prisma.store?.update({
            where: { id: storeId },
            data: { settings: updatedSettings },
        });
        return NextResponse.json(updatedPolicies);
    }
    catch (error: unknown) {
        logger.error("[STORE_POLICIES_POST] Failed to update policies", { storeId, error });
        return NextResponse.json({ error: "Failed to update policies" }, { status: 500 });
    }
});
