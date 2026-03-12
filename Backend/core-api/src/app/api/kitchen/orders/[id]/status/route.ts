import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, FulfillmentStatus } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFulfillmentStatus(value: unknown): FulfillmentStatus | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toUpperCase();
  return (Object.values(FulfillmentStatus) as string[]).includes(normalized)
    ? (normalized as FulfillmentStatus)
    : undefined;
}

export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const status = parseFulfillmentStatus(body.status);

      if (!status) {
        return NextResponse.json({ error: "Status required" }, { status: 400 });
      }

      const order = await prisma.order.update({
        where: { id, storeId },
        data: {
          fulfillmentStatus: status as FulfillmentStatus,
        },
      });

      return NextResponse.json({ success: true, order });
    } catch (error: unknown) {
      logger.error("[KITCHEN_ORDER_STATUS_PATCH]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
