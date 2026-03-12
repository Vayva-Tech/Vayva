import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { OnboardingService } from "@/services/onboarding.server";
import { logger } from "@/lib/logger";
import { OnboardingStatus } from "@vayva/shared/types";
import type { OnboardingState } from "@/types/onboarding";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isOnboardingStatus(value: unknown): value is OnboardingStatus {
  return Object.values(OnboardingStatus).includes(value as OnboardingStatus);
}

export const GET = withVayvaAPI(
  PERMISSIONS.ONBOARDING_VIEW,
  async (request, { storeId }) => {
    try {
      const state = await OnboardingService.getState(storeId);
      return NextResponse.json(state);
    } catch (error: unknown) {
      logger.error("[ONBOARDING_STATE_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch onboarding state" },
        { status: 500 },
      );
    }
  },
);
export const PUT = withVayvaAPI(
  PERMISSIONS.ONBOARDING_MANAGE,
  async (request, { storeId }) => {
    try {
      const parsedBody: unknown = await request.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const { data } = body;
      const safeData = isRecord(data)
        ? (data as Partial<OnboardingState>)
        : undefined;
      const step = getString(body.step);
      const status = getString(body.status);
      const isComplete =
        typeof body.isComplete === "boolean" ? body.isComplete : undefined;
      const updated = await OnboardingService.updateState(storeId, {
        step,
        data: safeData,
        status,
        isComplete,
      });
      // Sync status to Store model if provided (Release Blocker Fix)
      if (isOnboardingStatus(status)) {
        const prisma = (await import("@/lib/db")).prisma;
        await prisma.store.update({
          where: { id: storeId },
          data: { onboardingStatus: status },
        });
      }
      return NextResponse.json(updated, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[ONBOARDING_STATE_PUT]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update onboarding state" },
        { status: 500 },
      );
    }
  },
);
