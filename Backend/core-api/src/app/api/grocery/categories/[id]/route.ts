import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const CategoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
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

    const category = await prisma.groceryCategory.findFirst({
      where: { id, storeId },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    return NextResponse.json(
      { data: category },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_CATEGORY_GET]", { error, categoryId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch category" },
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
    const parseResult = CategoryUpdateSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid category data",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const updatedCategory = await prisma.groceryCategory.update({
      where: { id_storeId: { id, storeId } },
      data: parseResult.data,
    });

    logger.info("[GROCERY_CATEGORY_UPDATE]", {
      categoryId: id,
      updatedFields: Object.keys(parseResult.data),
    });

    return NextResponse.json(
      { data: updatedCategory },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_CATEGORY_UPDATE]", { error, categoryId: params.id });
    return NextResponse.json(
      { error: "Failed to update category" },
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

    // Check if category has products or children
    const [productCount, childCount] = await Promise.all([
      prisma.groceryProduct.count({ where: { categoryId: id } }),
      prisma.groceryCategory.count({ where: { parentId: id } }),
    ]);

    if (productCount > 0 || childCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with products or subcategories" },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    await prisma.groceryCategory.delete({
      where: { id_storeId: { id, storeId } },
    });

    logger.info("[GROCERY_CATEGORY_DELETE]", { categoryId: id });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_CATEGORY_DELETE]", { error, categoryId: params.id });
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}