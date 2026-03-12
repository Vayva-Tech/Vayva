import { NextResponse } from "next/server";
import { z } from "zod";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

const querySchema = z.object({
  customerId: z.string().min(1),
});

const deliveredStatuses = new Set(["DELIVERED", "COMPLETED", "FULFILLED"]);

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db } = ctx;

  try {
    const { searchParams } = new URL(request.url);
    const parse = querySchema.safeParse({
      customerId: searchParams.get("customerId"),
    });

    if (!parse.success) {
      return NextResponse.json(
        { error: "customerId is required", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    const { customerId } = parse.data;

    const orders = await db.order.findMany({
      where: {
        customerId,
        paymentStatus: "SUCCESS",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        status: true,
        items: {
          select: {
            productId: true,
          },
        },
      },
    });

    const deliveries = orders
      .map((order: typeof orders[0]) => {
        const mealIds = order.items
          .map((item: typeof order.items[0]) => item.productId)
          .filter((id: unknown): id is string => typeof id === "string" && id.length > 0);

        if (mealIds.length === 0) return null;

        return {
          id: order.id,
          date: order.createdAt,
          mealIds,
          isDelivered: deliveredStatuses.has(String(order.status || "")),
        };
      })
      .filter((d: {id: string, date: Date, mealIds: string[], isDelivered: boolean} | null): d is {id: string, date: Date, mealIds: string[], isDelivered: boolean} => d !== null);

    return NextResponse.json(
      { deliveries, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (error: unknown) {
    if (error instanceof BaseError) throw error;

    logger.error("Failed to fetch customer order history", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      app: "storefront",
    });

    return NextResponse.json(
      { error: "Failed to fetch order history", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
