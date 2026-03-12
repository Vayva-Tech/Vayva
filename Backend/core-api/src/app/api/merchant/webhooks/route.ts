import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { standardHeaders, logger } from "@vayva/shared";
import { randomBytes } from "crypto";

/**
 * GET /api/merchant/webhooks
 * List all webhook subscriptions for the store
 */
export const GET = withVayvaAPI(
  PERMISSIONS.SETTINGS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    try {
      const webhooks = await prisma.webhookSubscription.findMany({
        where: { storeId, isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          events: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Don't return secret
          _count: {
            select: {
              deliveries: {
                where: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                  },
                },
              },
            },
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: webhooks.map((wh) => ({
            ...wh,
            deliveryCount: wh._count.deliveries,
            _count: undefined,
          })),
        },
        { headers: standardHeaders(correlationId) }
      );
    } catch (error: unknown) {
      logger.error("[WEBHOOKS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch webhooks" },
        { status: 500, headers: standardHeaders(correlationId) }
      );
    }
  }
);

/**
 * POST /api/merchant/webhooks
 * Create a new webhook subscription
 */
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    try {
      const body = await req.json();
      const { url, events } = body;

      // Validation
      if (!url || typeof url !== "string") {
        return NextResponse.json(
          { error: "URL is required" },
          { status: 400, headers: standardHeaders(correlationId) }
        );
      }

      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400, headers: standardHeaders(correlationId) }
        );
      }

      if (!Array.isArray(events) || events.length === 0) {
        return NextResponse.json(
          { error: "At least one event is required" },
          { status: 400, headers: standardHeaders(correlationId) }
        );
      }

      // Validate event types
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

      const invalidEvents = events.filter((e) => !validEvents.includes(e));
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          { error: `Invalid events: ${invalidEvents.join(", ")}` },
          { status: 400, headers: standardHeaders(correlationId) }
        );
      }

      // Check max webhooks per store (limit to 10)
      const existingCount = await prisma.webhookSubscription.count({
        where: { storeId, isActive: true },
      });

      if (existingCount >= 10) {
        return NextResponse.json(
          { error: "Maximum 10 webhooks allowed per store" },
          { status: 400, headers: standardHeaders(correlationId) }
        );
      }

      // Generate secret for signing
      const secret = randomBytes(32).toString("hex");

      const webhook = await prisma.webhookSubscription.create({
        data: {
          storeId,
          url,
          events,
          secret,
          isActive: true,
        },
        select: {
          id: true,
          url: true,
          events: true,
          isActive: true,
          createdAt: true,
          secret: true, // Return secret only on creation
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: webhook,
          message: "Webhook created successfully. Save the secret - it won't be shown again.",
        },
        { status: 201, headers: standardHeaders(correlationId) }
      );
    } catch (error: unknown) {
      logger.error("[WEBHOOKS_POST]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create webhook" },
        { status: 500, headers: standardHeaders(correlationId) }
      );
    }
  }
);
