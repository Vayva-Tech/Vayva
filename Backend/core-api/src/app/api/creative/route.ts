import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma as _prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z as _z } from "zod";

// Main creative route - serves as entry point and overview
export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Return creative industry overview and available endpoints
      const overview = {
        industry: "Creative",
        description: "Creative agencies, design studios, photography, and media production",
        endpoints: {
          projects: "/api/creative/projects",
          clients: "/api/creative/clients",
          tasks: "/api/creative/tasks",
          timesheets: "/api/creative/timesheets",
          invoices: "/api/creative/invoices",
          billing: "/api/creative/billing",
          assets: "/api/creative/assets",
          reports: "/api/creative/reports"
        },
        features: [
          "Project management",
          "Client collaboration",
          "Time tracking",
          "Creative asset management",
          "Billing and invoicing",
          "Resource allocation",
          "Portfolio management",
          "Creative workflow"
        ]
      };

      return NextResponse.json(
        { data: overview },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch creative overview" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);