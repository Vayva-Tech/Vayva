import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma, Prisma, $Enums } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

type WebhookWithStore = Prisma.WebhookEventGetPayload<{
  include: { store: { select: { name: true; slug: true } } };
}>;

export async function GET(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const searchParams = req.nextUrl?.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("q") || "";
    const provider = searchParams.get("provider") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.WebhookEventWhereInput = {
      AND: [
        provider ? { provider: { equals: provider, mode: "insensitive" } } : {},
        status ? { status: status as $Enums.WebhookEventStatus } : {},
        search
          ? {
              OR: [
                { eventType: { contains: search, mode: "insensitive" } },
                { eventId: { contains: search, mode: "insensitive" } },
                { store: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    };

    const [webhooks, total] = await Promise.all([
      prisma.webhookEvent?.findMany({
        where,
        take: limit,
        skip,
        orderBy: { receivedAt: "desc" },
        include: {
          store: {
            select: { name: true, slug: true },
          },
        },
      }),
      prisma.webhookEvent?.count({ where }),
    ]);

    const data = (webhooks || []).map((w) => ({
      id: w.id,
      provider: w.provider,
      eventType: w.eventType,
      status: w.status?.toUpperCase?.() || "UNKNOWN",
      receivedAt: w.receivedAt,
      processedAt: w.processedAt,
      error: w.error,
      storeName: w.store?.name || "Unknown Store",
      storeSlug: w.store?.slug,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[WEBHOOKS_LIST_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
