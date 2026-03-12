import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { webhookManager } from "@vayva/integrations/webhooks/manager";

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      
      const result = await webhookManager.replayDelivery(id);

      logger.info("[WEBHOOK_REPLAY] Replayed webhook delivery", {
        deliveryId: id,
        storeId,
        success: result.success,
      });

      return NextResponse.json(result, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error: unknown) {
      logger.error("[WEBHOOK_REPLAY]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to replay webhook delivery" },
        { status: 500 }
      );
    }
  }
);
