import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
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
    handleApiError(error, { endpoint: "/api/editor-data/dishes", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
