import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

/**
 * GET /api/beauty/inventory/[id]
 * Get specific product details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        storeId,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: id,
      },
      include: {
        order: {
          select: {
            createdAt: true,
            status: true,
          },
        },
      },
      orderBy: {
        order: { createdAt: "desc" },
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        salesHistory: orderItems,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/inventory/[id]",
      operation: "GET_INVENTORY_ITEM",
    });
    return NextResponse.json({ error: "Failed to fetch inventory item" }, { status: 500 });
  }
}
