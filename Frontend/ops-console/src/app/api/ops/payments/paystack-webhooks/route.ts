import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma, $Enums } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

type EventWithStore = Prisma.PaymentWebhookEventGetPayload<object>;

export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!user || !["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = req.nextUrl?.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const storeId = (searchParams.get("storeId") || "").trim();

    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWebhookEventWhereInput = {
      AND: [
        { provider: "paystack" },
        storeId ? { storeId } : {},
        status ? { status: status as $Enums.WebhookEventStatus } : {},
        q
          ? {
              OR: [
                { providerEventId: { contains: q, mode: "insensitive" } },
                { eventType: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.paymentWebhookEvent?.findMany({
        where,
        take: limit,
        skip,
        orderBy: { receivedAt: "desc" },
      }),
      prisma.paymentWebhookEvent?.count({ where }),
    ]);

    const data = items.map((e) => ({
      id: e.id,
      storeId: e.storeId,
      provider: e.provider,
      providerEventId: e.providerEventId,
      eventType: e.eventType,
      status: e.status,
      error: e.error,
      receivedAt: e.receivedAt,
      processedAt: e.processedAt,
      payload: e.payload,
    }));

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error("[OPS_PAYSTACK_WEBHOOK_EVENTS_LIST_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
