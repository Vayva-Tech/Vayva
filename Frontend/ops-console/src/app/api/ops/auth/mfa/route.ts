import { OpsAuthService } from "@/lib/ops-auth";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@vayva/shared";

/**
 * DELETE /api/ops/auth/mfa
 * Disable MFA for user (requires password confirmation)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await OpsAuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 },
      );
    }

    // Verify password before disabling MFA
    const bcrypt = await import("bcryptjs");
    const isValid = await bcrypt.compare(password, session.user?.password);

    if (!isValid) {
      await OpsAuthService.logEvent(session.user?.id, "OPS_MFA_DISABLE_FAILED", {
        reason: "invalid_password",
      });
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 },
      );
    }

    await (OpsAuthService as any).disableMFA(session.user?.id);

    return NextResponse.json({
      success: true,
      message: "MFA disabled successfully",
    });
  } catch (error: unknown) {
    logger.error("[MFA_DISABLE_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to disable MFA" },
      { status: 500 },
    );
  }
}
