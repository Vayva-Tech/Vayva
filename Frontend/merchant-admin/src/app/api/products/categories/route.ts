import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/products/categories - Get product categories
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/products/categories`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch product categories" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch product categories" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[PRODUCTS_CATEGORIES_ERROR] Failed to fetch product categories", { error: error instanceof Error ? error.message : String(error), storeId });
      
      // Fallback categories
      return NextResponse.json({
        categories: ['Clothing', 'Electronics', 'Food & Beverage', 'Beauty', 'Home & Garden']
      });
    }
  }
);