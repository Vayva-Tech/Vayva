import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { webhookManager } from "@vayva/integrations/webhooks/manager";
import type { WebhookEventType } from "@vayva/integrations/types";

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const webhook = await webhookManager.getWebhook(storeId, id);

      if (!webhook) {
        return NextResponse.json(
          { error: "Webhook not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { webhook },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[WEBHOOK_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch webhook" },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const data = updateWebhookSchema.parse(body);

      const webhook = await webhookManager.updateWebhook(storeId, id, {
        url: data.url,
        subscribedEvents: data.events as WebhookEventType[] | undefined,
      });

      logger.info("[WEBHOOK_PUT] Updated webhook", {
        webhookId: id,
        storeId,
      });

      return NextResponse.json(
        { webhook },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid input", details: error.errors },
          { status: 400 }
        );
      }
      logger.error("[WEBHOOK_PUT]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update webhook" },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params }: APIContext) => {
    try {
      const { id } = await params;
      await webhookManager.deleteWebhook(storeId, id);

      logger.info("[WEBHOOK_DELETE] Deleted webhook", {
        webhookId: id,
        storeId,
      });

      return NextResponse.json(
        { success: true },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[WEBHOOK_DELETE]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to delete webhook" },
        { status: 500 }
      );
    }
  }
);
