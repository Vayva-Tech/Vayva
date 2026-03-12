import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { standardHeaders, logger } from "@vayva/shared";

/**
 * GET /api/merchant/webhooks/[id]/deliveries
 * Get delivery history for a webhook
 */
export const GET = withVayvaAPI(
  PERMISSIONS.SETTINGS_VIEW,
  async (
    req: NextRequest,
    { storeId, correlationId, params }: APIContext & { params: { id: string } }
  ) => {
    try {
      const { id } = params;

      // Verify webhook belongs to store
      const webhook = await prisma.webhookSubscription.findFirst({
        where: { id, storeId },
      });

      if (!webhook) {
        return NextResponse.json(
          { error: "Webhook not found" },
          { status: 404, headers: standardHeaders(correlationId) }
        );
      }

      // Get query params for pagination
      const { searchParams } = new URL(req.url);
      const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");

      const where = {
        subscriptionId: id,
        ...(status && { status }),
      };

      const [deliveries, total] = await Promise.all([
        prisma.webhookDelivery.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          select: {
            id: true,
            eventType: true,
            status: true,
            attempts: true,
            responseStatus: true,
            deliveredAt: true,
            createdAt: true,
            // Don't include full payload or response body for performance
          },
        }),
        prisma.webhookDelivery.count({ where }),
      ]);

      return NextResponse.json(
        {
          success: true,
          data: deliveries,
          meta: {
            total,
            limit,
            offset,
          },
        },
        { headers: standardHeaders(correlationId) }
      );
    } catch (error: unknown) {
      logger.error("[WEBHOOK_DELIVERIES_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch deliveries" },
        { status: 500, headers: standardHeaders(correlationId) }
      );
    }
  }
);
