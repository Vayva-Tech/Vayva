import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

  try {
    const products = await db.product.findMany({
      where: {
        storeId,
        status: "ACTIVE",
        productType: "SERVICE",
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        metadata: true,
      },
    });

    const formatted = products.map((p: any) => {
      const meta = (p.metadata as Record<string, unknown> | null) || {};
      const durationMinutesRaw = meta.durationMinutes;
      const durationMinutes = Number.isFinite(Number(durationMinutesRaw))
        ? Number(durationMinutesRaw)
        : 60;
      const hasDeposit = Boolean((meta as any).hasDeposit);

      return {
        id: p.id,
        name: p.title,
        description: p.description || null,
        price: Number(p.price) || 0,
        serviceDetails: {
          duration: durationMinutes,
          hasDeposit,
        },
      };
    });

    return NextResponse.json(
      { data: formatted, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;
    logger.error("Failed to fetch storefront services", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
      app: "storefront",
    });
    return NextResponse.json(
      { error: "Internal server error", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
