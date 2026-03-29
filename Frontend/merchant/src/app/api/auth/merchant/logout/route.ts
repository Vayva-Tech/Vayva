import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session.server";
import { apiError, ApiErrorCode } from "@vayva/shared";
import { handleApiError } from "@/lib/api-error-handler";
export async function POST(_request: Request) {
  try {
    // Clear session and delete from database
    await clearSession();
    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/auth/merchant/logout",
        operation: "MERCHANT_LOGOUT",
      }
    );
    throw error;
  }
}
