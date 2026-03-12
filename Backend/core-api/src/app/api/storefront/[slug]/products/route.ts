import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    // Get search params for filtering
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const productType = searchParams.get("productType");
    const limit = Number(searchParams.get("limit")) || 50;
    // Find the store first
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    // Build the query
    const where: Prisma.ProductWhereInput = {
      storeId: store.id,
      status: "ACTIVE",
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(productType
        ? { productType }
        : category
          ? { productType: category }
          : {}),
    };
    // Execute query
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        compareAtPrice: true,
        handle: true,
        productType: true,
        productImages: {
          orderBy: { position: "asc" },
          take: 1,
          select: { url: true }, // Optimization
        },
      },
    });
    // Transform formatting to match what templates expect
    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.title,
      description: p.description,
      price: Number(p.price),
      originalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      image: p.productImages?.[0]?.url || "",
      category: p.productType,
      rating: 5.0,
    }));
    return NextResponse.json(formattedProducts, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("[STOREFRONT_PRODUCTS]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
