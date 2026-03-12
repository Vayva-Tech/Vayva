import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ProductUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  cost: z.number().nonnegative().optional(),
  unit: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  perishable: z.boolean().optional(),
  expirationDays: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const product = await prisma.groceryProduct.findFirst({
      where: { id, storeId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            parentId: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            contactName: true,
            rating: true,
          },
        },
        _count: {
          select: {
            sales: true,
            reviews: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    return NextResponse.json(
      { data: product },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_PRODUCT_GET]", { error, productId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const json = await req.json().catch(() => ({}));
    const parseResult = ProductUpdateSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid product data",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const updatedProduct = await prisma.groceryProduct.update({
      where: { id_storeId: { id, storeId } },
      data: parseResult.data,
    });

    logger.info("[GROCERY_PRODUCT_UPDATE]", {
      productId: id,
      updatedFields: Object.keys(parseResult.data),
    });

    return NextResponse.json(
      { data: updatedProduct },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_PRODUCT_UPDATE]", { error, productId: params.id });
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Check if product has active orders
    const activeOrders = await prisma.groceryOrderItem.count({
      where: {
        productId: id,
        order: {
          status: { in: ["pending", "processing", "shipped"] },
        },
      },
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with active orders" },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    await prisma.groceryProduct.delete({
      where: { id_storeId: { id, storeId } },
    });

    logger.info("[GROCERY_PRODUCT_DELETE]", { productId: id });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_PRODUCT_DELETE]", { error, productId: params.id });
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}