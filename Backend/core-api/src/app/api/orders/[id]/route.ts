import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { OrderStateService } from "@/services/order-state.service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getErrorMessage(upstreamData: unknown, fallback: string): string {
  if (!isRecord(upstreamData)) return fallback;

  const errorValue = upstreamData.error;
  if (typeof errorValue === "string" && errorValue.length > 0)
    return errorValue;

  if (isRecord(errorValue)) {
    const message = errorValue.message;
    if (typeof message === "string" && message.length > 0) return message;
  }

  return fallback;
}

// GET /api/orders/[id] - Get Order Details
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const upstreamBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      const isAbsoluteUpstream =
        typeof upstreamBaseUrl === "string" &&
        /^https?:\/\//i.test(upstreamBaseUrl);
      if (isAbsoluteUpstream) {
        const base = upstreamBaseUrl.replace(/\/$/, "");
        const upstreamUrl = `${base}/orders/${id}`;

        const upstreamResponse = await fetch(upstreamUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
        });

        const upstreamData = await upstreamResponse
          .json()
          .catch(async () => ({ raw: await upstreamResponse.text() }));
        if (!upstreamResponse.ok) {
          const message = getErrorMessage(
            upstreamData,
            "Failed to fetch order",
          );
          return NextResponse.json(
            { error: message },
            { status: upstreamResponse.status },
          );
        }

        return NextResponse.json(upstreamData);
      }

      const order = await prisma.order.findUnique({
        where: { id, storeId },
        include: {
          items: { include: { productVariant: true } },
          customer: true, // lowercase per schema
          shipments: true,
          paymentTransactions: true,
          orderEvents: { orderBy: { createdAt: "desc" } },
        },
      });
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          {
            status: 404,
            headers: {
              "Cache-Control": "no-store",
            },
          },
        );
      }
      return NextResponse.json(order, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[ORDER_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
// PATCH /api/orders/[id] - Update Order Status
export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, user, params }) => {
    const { id } = await params;
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const status = getString(body.status); // Expecting FulfillmentStatus
      if (!status) {
        return NextResponse.json({ error: "Missing status" }, { status: 400 });
      }

      const upstreamBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      const isAbsoluteUpstream =
        typeof upstreamBaseUrl === "string" &&
        /^https?:\/\//i.test(upstreamBaseUrl);
      if (isAbsoluteUpstream) {
        const base = upstreamBaseUrl.replace(/\/$/, "");
        const upstreamUrl = `${base}/orders/${id}`;

        const upstreamResponse = await fetch(upstreamUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
            "x-user-id": user?.id || "",
          },
          body: JSON.stringify({ status }),
        });

        const upstreamData = await upstreamResponse
          .json()
          .catch(async () => ({ raw: await upstreamResponse.text() }));
        if (!upstreamResponse.ok) {
          const message = getErrorMessage(
            upstreamData,
            "Failed to update order",
          );
          return NextResponse.json(
            { error: message },
            { status: upstreamResponse.status },
          );
        }

        return NextResponse.json({ success: true, order: upstreamData });
      }

      // Use OrderStateService for transition logic & notifications
      const updatedOrder = await OrderStateService.transition(
        id,
        status,
        user.id,
        storeId,
      );
      return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: unknown) {
      logger.error("[ORDER_UPDATE]", error, { storeId, userId: user?.id });
      const isNotFound =
        error instanceof Error && error.message === "Order not found";
      return NextResponse.json(
        { error: isNotFound ? "Order not found" : "Failed to update order" },
        { status: isNotFound ? 404 : 500 },
      );
    }
  },
);
