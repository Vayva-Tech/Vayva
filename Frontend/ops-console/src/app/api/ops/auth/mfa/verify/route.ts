import { OpsAuthService } from "@/lib/ops-auth";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@vayva/shared";

/**
 * POST /api/ops/auth/mfa/verify
 * Verify MFA code and enable MFA for user
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();

    const { code } = await req.json();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid MFA code format" },
        { status: 400 },
      );
    }

    const isValid = await (OpsAuthService as any).verifyAndEnableMFA(user.id, code);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid MFA code" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "MFA enabled successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[MFA_VERIFY_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to verify MFA" },
      { status: 500 },
    );
  }
}
