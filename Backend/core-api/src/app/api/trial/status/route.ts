/**
 * GET /api/trial/status
 * Get current trial status for the authenticated store
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthStoreId } from "@/lib/auth";
import { creditManager } from "@/lib/credits/credit-manager";
import { logger } from "@vayva/shared";

export async function GET(req: NextRequest) {
  try {
    const storeId = await getAuthStoreId(req);
    
    if (!storeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const status = await creditManager.getTrialStatus(storeId);

    return NextResponse.json({
      isActive: status.isActive,
      daysRemaining: status.daysRemaining,
      startDate: status.startDate,
      endDate: status.endDate,
      expired: status.expired,
    });
  } catch (error) {
    logger.error("[TRIAL_STATUS_ERROR]", {
      error: error instanceof Error ? error.message : String(error),
      app: "core-api",
    });

    return NextResponse.json(
      { error: "Failed to fetch trial status" },
      { status: 500 }
    );
  }
}
