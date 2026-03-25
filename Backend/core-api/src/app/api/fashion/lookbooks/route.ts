import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Validation schemas
const CreateLookbookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  coverImage: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  productIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const _UpdateLookbookSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  productIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const QuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().positive()).default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default("20"),
  search: z.string().optional(),
  isActive: z.string().transform((val) => val === "true").optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_LOOKBOOKS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      // Parse and validate query parameters
      const queryData = Object.fromEntries(searchParams.entries());
      const { page, limit, search, isActive } = QuerySchema.parse(queryData);
      
      // Build where clause
      const where: any = { storeId };
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
      
      // Fetch lookbooks with pagination
      const [lookbooks, total] = await Promise.all([
        db.lookbook.findMany({
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
                    images: true,
                    price: true,
                  },
                },
              },
            },
          },
        }),
        db.lookbook.count({ where }),
      ]);
      
      return NextResponse.json({
        success: true,
        data: lookbooks,
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
      
      logger.error("[FASHION_LOOKBOOKS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LOOKBOOKS_FETCH_FAILED",
            message: "Failed to fetch lookbooks",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.FASHION_LOOKBOOKS_MANAGE,
  async (req, { storeId, db, user }) => {
    try {
      const body = await req.json();
      const validatedData = CreateLookbookSchema.parse(body);
      
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
      
      // Create lookbook
      const lookbook = await db.lookbook.create({
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
      
      logger.info("[FASHION_LOOKBOOK_CREATED]", {
        lookbookId: lookbook.id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: lookbook,
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
      
      logger.error("[FASHION_LOOKBOOKS_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LOOKBOOK_CREATE_FAILED",
            message: "Failed to create lookbook",
          },
        },
        { status: 500 }
      );
    }
  }
);