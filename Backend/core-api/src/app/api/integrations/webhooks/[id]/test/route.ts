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
      
      // Get the webhook to retrieve the URL
      const webhook = await webhookManager.getWebhook(storeId, id);
      
      if (!webhook) {
        return NextResponse.json(
          { error: "Webhook not found" },
          { status: 404 }
        );
      }

      const result = await webhookManager.testWebhook(
        storeId,
        webhook.url,
        webhook.secretEnc
      );

      logger.info("[WEBHOOK_TEST] Tested webhook", {
        webhookId: id,
        storeId,
        success: result.success,
      });

      return NextResponse.json(result, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error: unknown) {
      logger.error("[WEBHOOK_TEST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to test webhook" },
        { status: 500 }
      );
    }
  }
);
