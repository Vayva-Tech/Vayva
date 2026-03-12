import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { webhookManager } from "@vayva/integrations/webhooks/manager";

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const { searchParams } = new URL(request.url);
      const hours = parseInt(searchParams.get("hours") || "24", 10);

      const stats = await webhookManager.getDeliveryStats(id, hours);

      return NextResponse.json(stats, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error: unknown) {
      logger.error("[WEBHOOK_STATS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch webhook stats" },
        { status: 500 }
      );
    }
  }
);
