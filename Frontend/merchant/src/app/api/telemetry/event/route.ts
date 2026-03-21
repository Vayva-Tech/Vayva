import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
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
  } catch (error) {
    handleApiError(error, { endpoint: "/api/telemetry/event", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
