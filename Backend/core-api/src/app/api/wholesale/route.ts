import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma as _prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z as _z } from "zod";

// Main wholesale route - serves as entry point and overview
export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Return wholesale industry overview and available endpoints
      const overview = {
        industry: "Wholesale",
        description: "B2B wholesale distribution and supply chain management",
        endpoints: {
          suppliers: "/api/wholesale/suppliers",
          customers: "/api/wholesale/customers",
          products: "/api/wholesale/products",
          orders: "/api/wholesale/orders",
          "purchase-orders": "/api/wholesale/purchase-orders",
          invoices: "/api/wholesale/invoices",
          shipments: "/api/wholesale/shipments",
          analytics: "/api/wholesale/analytics"
        },
        features: [
          "B2B customer management",
          "Supplier relationship management",
          "Bulk order processing",
          "Purchase order workflow",
          "Invoice generation",
          "Shipment tracking",
          "Supply chain analytics",
          "Inventory forecasting"
        ]
      };

      return NextResponse.json(
        { data: overview },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch wholesale overview" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);