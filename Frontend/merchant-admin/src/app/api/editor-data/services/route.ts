import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    // Services for appointment bookings are stored as Products with productType = "SERVICE"
    const services = await prisma.product?.findMany({
      where: {
        storeId,
        productType: "SERVICE",
        ...(query && {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        price: true,
        description: true,
        metadata: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }) || [];

    const formatted = services.map((svc) => {
      const meta = (svc.metadata as Record<string, unknown> | null) || null;
      const durationMinutes = meta ? Number(meta.durationMinutes) : NaN;

      return {
        id: svc.id,
        name: svc.title,
        price: Number(svc.price) || 0,
        duration: Number.isFinite(durationMinutes) ? durationMinutes : 60,
        description: svc.description || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    logger.error("[EDITOR_DATA_SERVICES_GET] Failed to fetch services", { storeId, error });
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
});
