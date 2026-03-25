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

export const GET = withVayvaAPI(
  PERMISSIONS.CATEGORIES_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

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
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      return NextResponse.json(
        { data: category },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: categoryId } = await params;
      logger.error("[GROCERY_CATEGORY_GET]", { error, categoryId });
      return NextResponse.json(
        { error: "Failed to fetch category" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.CATEGORIES_MANAGE,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const json = await req.json().catch(() => ({}));
      const parseResult = CategoryUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid category data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

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
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: categoryId } = await params;
      logger.error("[GROCERY_CATEGORY_UPDATE]", { error, categoryId });
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.CATEGORIES_MANAGE,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const [productCount, childCount] = await Promise.all([
        prisma.groceryProduct.count({ where: { categoryId: id, storeId } }),
        prisma.groceryCategory.count({ where: { parentId: id, storeId } }),
      ]);

      if (productCount > 0 || childCount > 0) {
        return NextResponse.json(
          { error: "Cannot delete category with products or subcategories" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      await prisma.groceryCategory.delete({
        where: { id_storeId: { id, storeId } },
      });

      logger.info("[GROCERY_CATEGORY_DELETE]", { categoryId: id });

      return NextResponse.json(
        { message: "Category deleted successfully" },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: categoryId } = await params;
      logger.error("[GROCERY_CATEGORY_DELETE]", { error, categoryId });
      return NextResponse.json(
        { error: "Failed to delete category" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
