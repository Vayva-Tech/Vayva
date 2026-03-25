import { OpsAuthService } from "@/lib/ops-auth";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@vayva/shared";

/**
 * POST /api/ops/auth/mfa/setup
 * Generate MFA secret and QR code for user
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();

    const { secret, qrCodeUrl } = await (OpsAuthService as any).generateMFASecret(user.id);

    return NextResponse.json({
      secret,
      qrCodeUrl,
      message: "Scan the QR code with your authenticator app",
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[MFA_SETUP_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to generate MFA secret" },
      { status: 500 },
    );
  }
}
