import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await OpsAuthService.requireSession();

  try {
    const { id } = await params;

    // Log the resolution
    await OpsAuthService.logEvent(user.id, "RISK_FLAG_RESOLVED", {
      flagId: id,
    });

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[RISK_RESOLVE_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to resolve flag" },
      { status: 500 },
    );
  }
}
