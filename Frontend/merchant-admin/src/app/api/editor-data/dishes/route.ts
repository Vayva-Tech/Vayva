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

    // Menu items / dishes for food businesses
    const dishes = await prisma.menuItem?.findMany({
      where: {
        storeId,
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        category: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }) || [];

    const formatted = dishes.map((dish) => ({
      id: dish.id,
      name: dish.name,
      price: Number(dish.price) || 0,
      image: dish.imageUrl || null,
      category: dish.category || null,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    logger.error("[EDITOR_DATA_DISHES_GET] Failed to fetch dishes", { storeId, error });
    return NextResponse.json({ error: "Failed to fetch dishes" }, { status: 500 });
  }
});
