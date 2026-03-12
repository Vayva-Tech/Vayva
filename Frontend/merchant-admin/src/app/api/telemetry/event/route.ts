import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { eventName, properties } = body;
        
        // Extract canonical fields from props
        const templateSlug = properties?.templateSlug ||
            properties?.template ||
            properties?.templateId;
        const plan = properties?.plan;
        const entryPoint = properties?.entryPoint;
        const step = properties?.step || properties?.stepKey;
        const fastPath = !!properties?.fastPath;

        await prisma.onboardingAnalyticsEvent?.create({
            data: {
                storeId,
                sessionId: properties?.sessionId,
                eventName,
                templateSlug,
                plan,
                entryPoint,
                step,
                fastPath,
                metadata: properties || {},
            },
        });

        if (eventName === "ONBOARDING_ABANDONED") {
            logger.warn("[TELEMETRY] Onboarding abandoned", { templateSlug, step, storeId });
        }
        if (eventName === "ONBOARDING_STEP_ERROR") {
            logger.error("[TELEMETRY] Onboarding step error", { templateSlug, step, error: properties?.error, storeId });
        }

        return NextResponse.json({ success: true });
    }
    catch (e) {
        logger.error("[TELEMETRY_POST] Telemetry ingest error", { error: e });
        // Return 200 even on error to not break client
        return NextResponse.json({ success: false }, { status: 200 });
    }
});
