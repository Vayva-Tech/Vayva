import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const CategoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  parentId: z.string().optional(),
  activeOnly: z.boolean().default(false),
  search: z.string().optional(),
});

const CategoryCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().default(0),
  icon: z.string().optional(),
  color: z.string().optional(),
  featured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).default([]),
});

export const GET = withVayvaAPI(
  PERMISSIONS.CATEGORIES_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = CategoryQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, parentId, activeOnly, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (parentId) where.parentId = parentId;
      if (activeOnly) where.status = "active";
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [categories, total] = await Promise.all([
        prisma.groceryCategory.findMany({
          where,
          include: {
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                children: true,
                products: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { sortOrder: "asc" },
        }),
        prisma.groceryCategory.count({ where }),
      ]);

      // Calculate category metrics
      const categoriesWithMetrics = await Promise.all(
        categories.map(async (category) => {
          // Get product statistics
          const productStats = await prisma.groceryProduct.groupBy({
            by: ['status'],
            where: { categoryId: category.id },
            _count: { id: true },
          });

          const productCounts = productStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.id;
            return acc;
          }, { in_stock: 0, low_stock: 0, out_of_stock: 0 } as Record<string, number>);

          return {
            ...category,
            metaKeywords: JSON.parse(category.metaKeywords || "[]"),
            productStats: {
              total: productCounts.in_stock + productCounts.low_stock + productCounts.out_of_stock,
              inStock: productCounts.in_stock,
              lowStock: productCounts.low_stock,
              outOfStock: productCounts.out_of_stock,
              hasChildren: category._count.children > 0,
            },
          };
        })
      );

      return NextResponse.json(
        {
          data: categoriesWithMetrics,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_CATEGORIES_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.CATEGORIES_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = CategoryCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid category data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify parent category exists if provided
      if (body.parentId) {
        const parentCategory = await prisma.groceryCategory.findFirst({
          where: { id: body.parentId, storeId },
        });
        
        if (!parentCategory) {
          return NextResponse.json(
            { error: "Parent category not found" },
            { status: 404, headers: standardHeaders(requestId) }
          );
        }
      }

      // Check for duplicate category name
      const existingCategory = await prisma.groceryCategory.findFirst({
        where: { 
          name: body.name, 
          parentId: body.parentId || null,
          storeId,
        },
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 409, headers: standardHeaders(requestId) }
        );
      }

      const category = await prisma.groceryCategory.create({
        data: {
          storeId,
          name: body.name,
          description: body.description,
          parentId: body.parentId,
          sortOrder: body.sortOrder,
          icon: body.icon,
          color: body.color,
          featured: body.featured,
          seoTitle: body.seoTitle,
          seoDescription: body.seoDescription,
          metaKeywords: JSON.stringify(body.metaKeywords),
          status: "active",
        },
        include: {
          parent: {
            select: {
              name: true,
            },
          },
        },
      });

      return NextResponse.json(category, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[GROCERY_CATEGORIES_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);