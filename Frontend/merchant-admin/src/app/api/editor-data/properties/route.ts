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

    // Properties for real estate
    const properties = await prisma.property?.findMany({
      where: {
        storeId,
        ...(query && {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { state: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        address: true,
        city: true,
        state: true,
        bedrooms: true,
        bathrooms: true,
        status: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }) || [];

    const formatted = properties.map((prop) => ({
      id: prop.id,
      name: prop.title,
      price: Number(prop.price) || 0,
      images: prop.images || [],
      location: prop.address ? `${prop.address}${prop.city ? `, ${prop.city}` : ""}${prop.state ? `, ${prop.state}` : ""}` : null,
      bedrooms: prop.bedrooms || null,
      bathrooms: prop.bathrooms || null,
      status: prop.status || "available",
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    logger.error("[EDITOR_DATA_PROPERTIES_GET] Failed to fetch properties", { storeId, error });
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
});
