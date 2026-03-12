import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";

// GET /api/products/categories - Get distinct product categories
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Get distinct product types/categories from products
      const categoriesResult = await prisma.$queryRaw<{ product_type: string }[]>`
        SELECT DISTINCT "productType" as product_type
        FROM "Product"
        WHERE "storeId" = ${storeId}
        AND "productType" IS NOT NULL
        AND "productType" != ''
        ORDER BY "productType"
      `;

      const categories = categoriesResult.map(row => row.product_type);

      // If no categories found, return common default categories
      const defaultCategories = ['Clothing', 'Electronics', 'Food & Beverage', 'Beauty', 'Home & Garden'];
      
      return NextResponse.json(
        {
          categories: categories.length > 0 ? categories : defaultCategories
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error("Failed to fetch product categories", {
        requestId,
        error: msg,
        storeId,
        app: "merchant",
      });
      
      // Return default categories on error
      return NextResponse.json(
        { 
          categories: ['Clothing', 'Electronics', 'Food & Beverage', 'Beauty', 'Home & Garden']
        },
        { headers: standardHeaders(requestId) }
      );
    }
  }
);