import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { OnboardingService } from "@/services/onboarding.service";
import { prisma } from "@vayva/db";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const state = await OnboardingService.getState(storeId);
        return NextResponse.json(state);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/onboarding/state", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
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
  } catch (error) {
    handleApiError(error, { endpoint: "/api/onboarding/state", operation: "PUT" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
