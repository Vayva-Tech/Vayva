import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { getTenantFromHost } from "@/lib/tenant";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const GET = withStorefrontAPI(async (req: any, ctx: any) => {
  const { requestId } = ctx;
  try {
    const t = await getTenantFromHost(req.headers.get("host") || undefined);
    if (!t.ok) {
      return NextResponse.json(
        { error: "Store not found", requestId },
        { status: 404 },
      );
    }

    const store = await prisma.store.findUnique({
      where: { slug: t.slug },
      select: { id: true },
    });
    if (!store) {
      return NextResponse.json(
        { error: "Store not found", requestId },
        { status: 404 },
      );
    }

    try {
      const activeSale = await prisma.flashSale.findFirst({
        where: {
          storeId: store.id,
          isActive: true,
          startTime: { lte: new Date() },
          endTime: { gt: new Date() },
        },
        orderBy: { endTime: "asc" }, // Get the one ending soonest if multiple
      });

      if (!activeSale) {
        return NextResponse.json({}, { headers: standardHeaders(requestId) });
      }

      return NextResponse.json(activeSale, {
        headers: standardHeaders(requestId),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: unknown) {
      if (err instanceof BaseError) throw err;
      logger.error("Flash sale fetch error", {
        requestId,
        error: err instanceof Error ? err.message : String(err),
        app: "storefront",
      });
      return NextResponse.json(
        { error: "Internal Server Error", requestId },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (error instanceof BaseError) throw error;
    return NextResponse.json(
      { error: "Store lookup failed", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
