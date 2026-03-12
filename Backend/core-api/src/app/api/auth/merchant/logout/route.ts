import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session.server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { logger } from "@/lib/logger";
export async function POST(_request: Request) {
  try {
    // Clear session and delete from database
    await clearSession();
    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    logger.error("[AUTH_LOGOUT]", error);
    return NextResponse.json(
      apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Logout failed"),
      { status: 500 },
    );
  }
}
