import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

// Main professional services route - serves as entry point and overview
export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Return professional services industry overview and available endpoints
      const overview = {
        industry: "Professional Services",
        description: "Consulting firms, accounting practices, legal services, and advisory businesses",
        endpoints: {
          cases: "/api/professional/cases",
          clients: "/api/professional/clients",
          matters: "/api/professional/matters",
          documents: "/api/professional/documents",
          billing: "/api/professional/billing",
          timesheets: "/api/professional/timesheets",
          reports: "/api/professional/reports"
        },
        features: [
          "Case and matter management",
          "Client relationship management",
          "Time tracking and billing",
          "Document management",
          "Resource allocation",
          "Performance analytics",
          "Compliance tracking",
          "Professional workflow"
        ]
      };

      return NextResponse.json(
        { data: overview },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch professional services overview" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);