import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma as _prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z as _z } from "zod";

// Main grocery route - serves as entry point and overview
export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Return grocery industry overview and available endpoints
      const overview = {
        industry: "Grocery",
        description: "Supermarkets, grocery stores, and food retail operations",
        endpoints: {
          inventory: "/api/grocery/inventory",
          orders: "/api/grocery/orders", 
          suppliers: "/api/grocery/suppliers",
          categories: "/api/grocery/categories",
          promotions: "/api/grocery/promotions",
          reviews: "/api/grocery/reviews",
          analytics: "/api/grocery/analytics",
          reports: "/api/grocery/reports"
        },
        features: [
          "Inventory management",
          "Order processing",
          "Supplier coordination",
          "Category organization",
          "Promotional campaigns",
          "Customer reviews",
          "Sales analytics",
          "Operational reporting"
        ]
      };

      return NextResponse.json(
        { data: overview },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch grocery overview" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);