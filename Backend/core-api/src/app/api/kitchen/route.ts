import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma as _prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z as _z } from "zod";

// Main kitchen route - serves as entry point and overview
export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Return kitchen industry overview and available endpoints
      const overview = {
        industry: "Kitchen/KDS",
        description: "Restaurant kitchen display systems and order management",
        endpoints: {
          orders: "/api/kitchen/orders",
          tickets: "/api/kitchen/tickets", 
          stations: "/api/kitchen/stations",
          menu: "/api/kitchen/menu",
          prep: "/api/kitchen/prep",
          inventory: "/api/kitchen/inventory",
          reports: "/api/kitchen/reports"
        },
        features: [
          "Real-time order display",
          "Kitchen station management",
          "Prep time tracking",
          "Order prioritization",
          "Menu synchronization",
          "Inventory integration",
          "Performance analytics"
        ]
      };

      return NextResponse.json(
        { data: overview },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[KITCHEN_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch kitchen overview" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);