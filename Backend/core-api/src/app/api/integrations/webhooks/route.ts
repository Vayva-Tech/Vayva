import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { webhookManager } from "@vayva/integrations/webhooks/manager";
import type { WebhookEventType } from "@vayva/integrations/types";

const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  description: z.string().optional(),
  secret: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") as
        | "ACTIVE"
        | "PAUSED"
        | "DISABLED"
        | undefined;

      const webhooks = await webhookManager.getWebhooks(storeId, status);

      return NextResponse.json(
        { webhooks },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      logger.error("[WEBHOOKS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch webhooks" },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const body = await request.json();
      const data = createWebhookSchema.parse(body);

      const webhook = await webhookManager.createWebhook({
        storeId,
        url: data.url,
        events: data.events as WebhookEventType[],
        description: data.description,
        secret: data.secret,
      });

      logger.info("[WEBHOOKS_POST] Created webhook", {
        webhookId: webhook.id,
        storeId,
        url: data.url,
      });

      return NextResponse.json(
        {
          webhook: {
            id: webhook.id,
            url: webhook.url,
            status: webhook.status,
            subscribedEvents: webhook.subscribedEvents,
            createdAt: webhook.createdAt,
          },
          secret: webhook.secretEnc,
        },
        { status: 201, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid input", details: error.errors },
          { status: 400 }
        );
      }
      logger.error("[WEBHOOKS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create webhook" },
        { status: 500 }
      );
    }
  }
);
