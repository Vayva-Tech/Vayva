import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { webhookManager } from "@vayva/integrations/webhooks/manager";
import type { WebhookDeliveryStatus } from "@vayva/integrations/types";

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const status = searchParams.get("status") as WebhookDeliveryStatus | undefined;

      const deliveries = await webhookManager.getRecentDeliveries(id, limit, status);

      return NextResponse.json(
        { deliveries },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[WEBHOOK_DELIVERIES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch deliveries" },
        { status: 500 }
      );
    }
  }
);
