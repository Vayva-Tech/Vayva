import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const CreateIngredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  unit: z.enum(["KG", "G", "L", "ML", "PCS", "LB", "OZ"]),
  supplier: z.string().optional(),
  reorderPoint: z.number().min(0).optional(),
  preferredStockLevel: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_INGREDIENTS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get("search");
      const lowStockOnly = searchParams.get("lowStockOnly") === "true";
      
      const where: any = { storeId };
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          { supplier: { contains: search, mode: "insensitive" } },
        ];
      }
      
      if (lowStockOnly) {
        where.currentStock = {
          lt: db.ingredient.fields.reorderPoint,
        };
      }
      
      const ingredients = await db.ingredient.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              recipeIngredients: true,
            },
          },
        },
      });
      
      // Get low stock summary
      const lowStockCount = await db.ingredient.count({
        where: {
          storeId,
          currentStock: {
            lt: db.ingredient.fields.reorderPoint,
          },
        },
      });
      
      // Get inventory value
      const inventoryValue = await db.$queryRaw`
        SELECT 
          SUM(i."currentStock" * COALESCE(i."unitCost", 0)) as total_value,
          COUNT(*) as total_items,
          COUNT(CASE WHEN i."currentStock" < i."reorderPoint" THEN 1 END) as low_stock_items
        FROM "Ingredient" i
        WHERE i."storeId" = ${storeId}
      `;
      
      return NextResponse.json({
        success: true,
        data: ingredients,
        summary: {
          lowStockCount,
          inventoryValue: inventoryValue[0],
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
      
      logger.error("[RESTAURANT_INGREDIENTS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INGREDIENTS_FETCH_FAILED",
            message: "Failed to fetch ingredients",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.RESTAURANT_INGREDIENTS_MANAGE,
  async (req, { storeId, db, user }) => {
    try {
      const body = await req.json();
      const validatedData = CreateIngredientSchema.parse(body);
      
      const ingredient = await db.ingredient.create({
        data: {
          ...validatedData,
          storeId,
          createdBy: user.id,
        },
      });
      
      logger.info("[RESTAURANT_INGREDIENT_CREATED]", {
        ingredientId: ingredient.id,
        name: ingredient.name,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: ingredient,
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
      
      logger.error("[RESTAURANT_INGREDIENTS_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INGREDIENT_CREATE_FAILED",
            message: "Failed to create ingredient",
          },
        },
        { status: 500 }
      );
    }
  }
);