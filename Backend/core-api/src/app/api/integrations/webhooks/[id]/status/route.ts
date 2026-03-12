import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { webhookManager } from "@vayva/integrations/webhooks/manager";
import type { WebhookEndpointStatus } from "@vayva/integrations/types";

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "DISABLED"]),
});

export const PATCH = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const data = updateStatusSchema.parse(body);

      await webhookManager.setWebhookStatus(
        storeId,
        id,
        data.status as WebhookEndpointStatus
      );

      logger.info("[WEBHOOK_STATUS_PATCH] Updated webhook status", {
        webhookId: id,
        storeId,
        status: data.status,
      });

      return NextResponse.json(
        { success: true, status: data.status },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid input", details: error.errors },
          { status: 400 }
        );
      }
      logger.error("[WEBHOOK_STATUS_PATCH]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update webhook status" },
        { status: 500 }
      );
    }
  }
);
