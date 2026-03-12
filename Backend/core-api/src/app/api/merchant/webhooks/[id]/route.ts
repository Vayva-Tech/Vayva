import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { standardHeaders, logger } from "@vayva/shared";

/**
 * GET /api/merchant/webhooks/[id]
 * Get a specific webhook subscription
 */
export const GET = withVayvaAPI(
  PERMISSIONS.SETTINGS_VIEW,
  async (
    req: NextRequest,
    { storeId, correlationId, params }: APIContext & { params: { id: string } }
  ) => {
    try {
      const { id } = params;

      const webhook = await prisma.webhookSubscription.findFirst({
        where: { id, storeId, isActive: true },
        select: {
          id: true,
          url: true,
          events: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Don't return secret
        },
      });

      if (!webhook) {
        return NextResponse.json(
          { error: "Webhook not found" },
          { status: 404, headers: standardHeaders(correlationId) }
        );
      }

      return NextResponse.json(
        { success: true, data: webhook },
        { headers: standardHeaders(correlationId) }
      );
    } catch (error: unknown) {
      logger.error("[WEBHOOK_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch webhook" },
        { status: 500, headers: standardHeaders(correlationId) }
      );
    }
  }
);

/**
 * PUT /api/merchant/webhooks/[id]
 * Update a webhook subscription
 */
export const PUT = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (
    req: NextRequest,
    { storeId, correlationId, params }: APIContext & { params: { id: string } }
  ) => {
    try {
      const { id } = params;
      const body = await req.json();
      const { url, events, isActive } = body;

      // Check if webhook exists
      const existing = await prisma.webhookSubscription.findFirst({
        where: { id, storeId },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Webhook not found" },
          { status: 404, headers: standardHeaders(correlationId) }
        );
      }

      // Validate URL if provided
      if (url) {
        try {
          new URL(url);
        } catch {
          return NextResponse.json(
            { error: "Invalid URL format" },
            { status: 400, headers: standardHeaders(correlationId) }
          );
        }
      }

      // Validate events if provided
      if (events) {
        const validEvents = [
          "order.created",
          "order.paid",
          "order.fulfilled",
          "order.cancelled",
          "product.created",
          "product.updated",
          "product.deleted",
          "customer.created",
          "customer.updated",
        ];

        const invalidEvents = events.filter((e: string) => !validEvents.includes(e));
        if (invalidEvents.length > 0) {
          return NextResponse.json(
            { error: `Invalid events: ${invalidEvents.join(", ")}` },
            { status: 400, headers: standardHeaders(correlationId) }
          );
        }
      }

      const webhook = await prisma.webhookSubscription.update({
        where: { id },
        data: {
          ...(url && { url }),
          ...(events && { events }),
          ...(typeof isActive === "boolean" && { isActive }),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          url: true,
          events: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json(
        { success: true, data: webhook },
        { headers: standardHeaders(correlationId) }
      );
    } catch (error: unknown) {
      logger.error("[WEBHOOK_PUT]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to update webhook" },
        { status: 500, headers: standardHeaders(correlationId) }
      );
    }
  }
);

/**
 * DELETE /api/merchant/webhooks/[id]
 * Delete (deactivate) a webhook subscription
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (
    req: NextRequest,
    { storeId, correlationId, params }: APIContext & { params: { id: string } }
  ) => {
    try {
      const { id } = params;

      // Check if webhook exists
      const existing = await prisma.webhookSubscription.findFirst({
        where: { id, storeId },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Webhook not found" },
          { status: 404, headers: standardHeaders(correlationId) }
        );
      }

      // Soft delete by deactivating
      await prisma.webhookSubscription.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        { success: true, message: "Webhook deleted successfully" },
        { headers: standardHeaders(correlationId) }
      );
    } catch (error: unknown) {
      logger.error("[WEBHOOK_DELETE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to delete webhook" },
        { status: 500, headers: standardHeaders(correlationId) }
      );
    }
  }
);
