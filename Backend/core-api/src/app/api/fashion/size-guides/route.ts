import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Validation schemas
const CreateSizeGuideSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.enum(["APPAREL", "SHOES", "ACCESSORIES"]).optional(),
  isActive: z.boolean().default(true),
  measurements: z.array(
    z.object({
      name: z.string().min(1),
      unit: z.enum(["CM", "IN", "EU"]),
      values: z.record(z.string(), z.number()),
    })
  ).optional(),
});

const QuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().positive()).default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default("20"),
  category: z.enum(["APPAREL", "SHOES", "ACCESSORIES"]).optional(),
  isActive: z.string().transform((val) => val === "true").optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_SIZE_GUIDES_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const queryData = Object.fromEntries(searchParams.entries());
      const { page, limit, category, isActive } = QuerySchema.parse(queryData);
      
      const where: any = { storeId };
      
      if (category) {
        where.category = category;
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }
      
      const [sizeGuides, total] = await Promise.all([
        db.sizeGuide.findMany({
          where,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        }),
        db.sizeGuide.count({ where }),
      ]);
      
      return NextResponse.json({
        success: true,
        data: sizeGuides,
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
      
      logger.error("[FASHION_SIZE_GUIDES_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SIZE_GUIDES_FETCH_FAILED",
            message: "Failed to fetch size guides",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.FASHION_SIZE_GUIDES_MANAGE,
  async (req, { storeId, db, user }) => {
    try {
      const body = await req.json();
      const validatedData = CreateSizeGuideSchema.parse(body);
      
      const sizeGuide = await db.sizeGuide.create({
        data: {
          ...validatedData,
          storeId,
          createdBy: user.id,
        },
      });
      
      logger.info("[FASHION_SIZE_GUIDE_CREATED]", {
        sizeGuideId: sizeGuide.id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: sizeGuide,
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
      
      logger.error("[FASHION_SIZE_GUIDES_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SIZE_GUIDE_CREATE_FAILED",
            message: "Failed to create size guide",
          },
        },
        { status: 500 }
      );
    }
  }
);