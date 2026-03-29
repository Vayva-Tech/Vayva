import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPERATOR");

    const { id } = await params;

    const response = await apiClient.post(`/api/v1/admin/webhooks/${id}/replay`);

    // Create audit log
    await OpsAuthService.logEvent(user.id, "WEBHOOK_REPLAY", {
      targetType: "WebhookEvent",
      targetId: id,
      reason: "Manual replay triggered by operator",
      ...response,
    });

    return NextResponse.json(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error instanceof Error
        ? error.message
        : String(error)?.includes("Insufficient permissions")
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }
    logger.error("[WEBHOOK_REPLAY_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
