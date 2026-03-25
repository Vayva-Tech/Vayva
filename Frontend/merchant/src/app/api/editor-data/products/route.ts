import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { prisma } from "@vayva/db";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const products = await prisma.product?.findMany({
      where: {
        storeId,
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
        handle: true,
        price: true,
        compareAtPrice: true,
        status: true,
        productImages: {
          take: 1,
          select: { url: true },
        },
        productVariants: {
          take: 1,
          select: { imageUrl: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }) || [];

    const formatted = products.map((product) => {
      const thumbnail =
        product.productImages?.[0]?.url ||
        product.productVariants?.[0]?.imageUrl ||
        null;

      return {
        id: product.id,
        name: product.title,
        handle: product.handle,
        price: Number(product.price) || 0,
        thumbnail,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/editor-data/products",
      operation: "GET_EDITOR_PRODUCTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
