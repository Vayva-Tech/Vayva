import { OpsAuthService } from "@/lib/ops-auth";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@vayva/shared";

/**
 * DELETE /api/ops/auth/mfa
 * Disable MFA for user (requires password confirmation)
 */
export async function DELETE(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();

    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 },
      );
    }

    // Verify password before disabling MFA
    const bcrypt = await import("bcryptjs");
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      await OpsAuthService.logEvent(user.id, "OPS_MFA_DISABLE_FAILED", {
        reason: "invalid_password",
      });
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 },
      );
    }

    await (OpsAuthService as any).disableMFA(user.id);

    return NextResponse.json({
      success: true,
      message: "MFA disabled successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[MFA_DISABLE_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to disable MFA" },
      { status: 500 },
    );
  }
}
