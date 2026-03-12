import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

// Main legal route - serves as entry point and overview
export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Return legal industry overview and available endpoints
      const overview = {
        industry: "Legal",
        description: "Law firms, legal practices, court systems, and legal services",
        endpoints: {
          cases: "/api/legal/cases",
          clients: "/api/legal/clients",
          matters: "/api/legal/matters",
          court: "/api/legal/court",
          dockets: "/api/legal/dockets",
          billing: "/api/legal/billing",
          timesheets: "/api/legal/timesheets",
          reports: "/api/legal/reports"
        },
        features: [
          "Case management",
          "Client relationship management",
          "Court filing and docket tracking",
          "Legal time tracking",
          "Billing and invoicing",
          "Document management",
          "Legal research tools",
          "Compliance monitoring"
        ]
      };

      return NextResponse.json(
        { data: overview },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[LEGAL_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch legal overview" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);