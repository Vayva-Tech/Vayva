import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Parallel Search across multiple models
    const [stores, shipments] = await Promise.all([
      prisma.store.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 3,
        select: { id: true, name: true, slug: true },
      }),
      prisma.shipment.findMany({
        where: {
          trackingCode: { contains: query, mode: "insensitive" },
        },
        take: 3,
        select: { id: true, trackingCode: true, status: true, provider: true },
      }),
    ]);

    const orders = isNaN(Number(query))
      ? []
      : await prisma.order.findMany({
          where: { orderNumber: Number(query) },
          take: 3,
          select: { id: true, orderNumber: true, total: true, storeId: true },
        });

    const results = [
      ...stores.map((s: any) => ({
        type: "store",
        label: s.name,
        subLabel: s.slug,
        url: `/ops/merchants/${s.id}`,
      })),
      ...orders.map((o) => ({
        type: "order",
        label: `Order #${o.orderNumber}`,
        subLabel: `₦${o.total}`,
        url: `/ops/orders/${o.id}`,
      })),
      ...shipments.map((s: any) => ({
        type: "shipment",
        label: `Delivery ${s.trackingCode}`,
        subLabel: s.provider,
        url: `/ops/deliveries/${s.id}`,
      })),
    ];

    return NextResponse.json({ results });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[SEARCH_API_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
