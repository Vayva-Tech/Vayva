import { OpsAuthService } from "@/lib/ops-auth";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@vayva/shared";

/**
 * POST /api/ops/auth/mfa/setup
 * Generate MFA secret and QR code for user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await OpsAuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { secret, qrCodeUrl } = await (OpsAuthService as any).generateMFASecret(session.user?.id);

    return NextResponse.json({
      secret,
      qrCodeUrl,
      message: "Scan the QR code with your authenticator app",
    });
  } catch (error: unknown) {
    logger.error("[MFA_SETUP_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to generate MFA secret" },
      { status: 500 },
    );
  }
}
