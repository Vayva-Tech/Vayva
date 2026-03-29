import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { opsApiAuthErrorResponse } from "@/lib/ops-api-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "OPERATOR");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const { merchantIds, type, template, customMessage } = await req.json();

    if (
      !merchantIds ||
      !Array.isArray(merchantIds) ||
      merchantIds.length === 0
    ) {
      return NextResponse.json(
        { error: "No merchants selected" },
        { status: 400 },
      );
    }

    if (!type || !["email", "whatsapp"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid notification type" },
        { status: 400 },
      );
    }

    const response = await apiClient.post('/api/v1/admin/notifications/send', {
      merchantIds,
      type,
      template,
      customMessage,
    });

    return NextResponse.json(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    logger.error("[SEND_NOTIFICATION_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 },
    );
  }
}
