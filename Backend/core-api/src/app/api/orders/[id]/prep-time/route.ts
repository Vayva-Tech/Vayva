import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, params, user }) => {
    try {
      const { id } = await params;
      const body = getObject(await req.json().catch(() => ({})));
      const prepTimeMinutes =
        getNumber(body.prepTimeMinutes) ?? Number(body.prepTimeMinutes);

      if (
        !Number.isFinite(prepTimeMinutes) ||
        prepTimeMinutes < 5 ||
        prepTimeMinutes > 480
      ) {
        return NextResponse.json(
          { error: "Invalid prep time" },
          { status: 400 },
        );
      }

      const order = await prisma.order.findFirst({
        where: { id, storeId },
        select: { id: true, metadata: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const metadata = getObject(order.metadata);

      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: {
            metadata: {
              ...metadata,
              prepTimeMinutes,
              prepTimeUpdatedAt: new Date().toISOString(),
            },
          },
        }),
        prisma.orderTimelineEvent.create({
          data: {
            orderId: id,
            title: "Prep time updated",
            body: `Prep time set to ${prepTimeMinutes} minutes by ${user?.email || "merchant"}.`,
          },
        }),
      ]);

      return NextResponse.json(
        { success: true },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    } catch (error) {
      logger.error("[ORDER_PREP_TIME_POST]", error);
      return NextResponse.json(
        { error: "Failed to update prep time" },
        { status: 500 },
      );
    }
  },
);
