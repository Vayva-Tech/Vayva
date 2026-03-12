import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger, ErrorCategory } from "@/lib/logger";

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const eventName = getString(body.eventName);
      const rawProperties = isRecord(body.properties) ? body.properties : {};

      const properties = rawProperties;

      // Extract canonical fields from props
      const templateSlug =
        properties.templateSlug || properties.template || properties.templateId;
      const plan = properties.plan;
      const entryPoint = properties.entryPoint;
      const step = properties.step || properties.stepKey;
      const fastPath = !!properties.fastPath;

      await prisma.onboardingAnalyticsEvent.create({
        data: {
          storeId,
          sessionId:
            typeof properties.sessionId === "string"
              ? properties.sessionId
              : undefined,
          eventName: typeof eventName === "string" ? eventName : "UNKNOWN",
          templateSlug:
            typeof templateSlug === "string" ? templateSlug : undefined,
          plan: typeof plan === "string" ? plan : undefined,
          entryPoint: typeof entryPoint === "string" ? entryPoint : undefined,
          step: typeof step === "string" ? step : undefined,
          fastPath,
          metadata: properties as Prisma.InputJsonValue,
        },
      });

      if (eventName === "ONBOARDING_ABANDONED") {
        logger.warn(
          `[ALERT] Onboarding Abandoned: Template=${templateSlug} Step=${step}`,
          ErrorCategory.VALIDATION,
          { storeId },
        );
      }
      if (eventName === "ONBOARDING_STEP_ERROR") {
        logger.error(
          `[ALERT] Onboarding Step Error: Template=${templateSlug} Step=${step} Error=${properties.error}`,
          ErrorCategory.VALIDATION,
          { storeId },
        );
      }

      return NextResponse.json({ success: true });
    } catch (e: unknown) {
      logger.error("[TELEMETRY_INGEST_ERROR]", e, { storeId });
      // Return 200 even on error to not break client
      return NextResponse.json({ success: false }, { status: 200 });
    }
  },
);
