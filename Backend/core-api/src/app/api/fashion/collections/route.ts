import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Validation schemas
const CreateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  productIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const QuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().positive()).default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default("20"),
  isActive: z.string().transform((val) => val === "true").optional(),
  isFeatured: z.string().transform((val) => val === "true").optional(),
  search: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_COLLECTIONS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const queryData = Object.fromEntries(searchParams.entries());
      const { page, limit, isActive, isFeatured, search } = QuerySchema.parse(queryData);
      
      const where: any = { storeId };
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }
      
      if (isFeatured !== undefined) {
        where.isFeatured = isFeatured;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ];
      }
      
      const [collections, total] = await Promise.all([
        db.collection.findMany({
          where,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { createdAt: "desc" },
          include: {
            products: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                    sku: true,
                  },
                },
              },
            },
            _count: {
              select: {
                products: true,
              },
            },
          },
        }),
        db.collection.count({ where }),
      ]);
      
      return NextResponse.json({
        success: true,
        data: collections,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid query parameters",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[FASHION_COLLECTIONS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COLLECTIONS_FETCH_FAILED",
            message: "Failed to fetch collections",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.FASHION_COLLECTIONS_MANAGE,
  async (req, { storeId, db, user }) => {
    try {
      const body = await req.json();
      const validatedData = CreateCollectionSchema.parse(body);
      
      // Verify product IDs belong to this store
      if (validatedData.productIds && validatedData.productIds.length > 0) {
        const products = await db.product.findMany({
          where: {
            id: { in: validatedData.productIds },
            storeId,
          },
          select: { id: true },
        });
        
        if (products.length !== validatedData.productIds.length) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "INVALID_PRODUCTS",
                message: "Some products do not belong to this store",
              },
            },
            { status: 400 }
          );
        }
      }
      
      // Check for duplicate slug
      const existingCollection = await db.collection.findFirst({
        where: {
          storeId,
          slug: validatedData.slug,
        },
      });
      
      if (existingCollection) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SLUG_EXISTS",
              message: "Collection with this slug already exists",
            },
          },
          { status: 409 }
        );
      }
      
      const collection = await db.collection.create({
        data: {
          ...validatedData,
          storeId,
          createdBy: user.id,
        },
        include: {
          products: validatedData.productIds
            ? {
                create: validatedData.productIds.map((productId) => ({
                  productId,
                })),
              }
            : false,
        },
      });
      
      logger.info("[FASHION_COLLECTION_CREATED]", {
        collectionId: collection.id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: collection,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request data",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[FASHION_COLLECTIONS_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COLLECTION_CREATE_FAILED",
            message: "Failed to create collection",
          },
        },
        { status: 500 }
      );
    }
  }
);