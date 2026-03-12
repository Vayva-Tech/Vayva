import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { OnboardingService } from "@/services/onboarding.service";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.ONBOARDING_VIEW, async (request: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const state = await OnboardingService.getState(storeId);
        return NextResponse.json(state);
    }
    catch (error) {
        logger.error("[ONBOARDING_STATE_GET] Failed to fetch onboarding state", error);
        return NextResponse.json({ error: "Failed to fetch onboarding state" }, { status: 500 });
    }
});
export const PUT = withVayvaAPI(PERMISSIONS.ONBOARDING_MANAGE, async (request: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await request.json();
        const { step, data, status, isComplete } = body;
        const updated = await OnboardingService.updateState(storeId, {
            step,
            data,
            status,
            isComplete
        });
        // Sync status to Store model if provided (Release Blocker Fix)
        if (status) {
            const prisma = (await import("@/lib/prisma")).prisma;
            await prisma.store?.update({
                where: { id: storeId },
                data: { onboardingStatus: status }
            });
        }
        return NextResponse.json(updated, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[ONBOARDING_STATE_PUT] Failed to update onboarding state", error);
        return NextResponse.json({ error: "Failed to update onboarding state" }, { status: 500 });
    }
});
