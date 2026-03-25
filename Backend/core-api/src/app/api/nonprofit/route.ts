import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma as _prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z as _z } from "zod";

// Main nonprofit route - serves as entry point and overview
export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Return nonprofit industry overview and available endpoints
      const overview = {
        industry: "Nonprofit",
        description: "Nonprofit organization management system",
        endpoints: {
          donations: "/api/nonprofit/donations",
          campaigns: "/api/nonprofit/campaigns", 
          donors: "/api/nonprofit/donors",
          volunteers: "/api/nonprofit/volunteers",
          grants: "/api/nonprofit/grants",
          impact: "/api/nonprofit/impact"
        },
        features: [
          "Donation management and tracking",
          "Campaign fundraising",
          "Donor relationship management",
          "Volunteer coordination",
          "Grant tracking and reporting",
          "Impact measurement and analytics"
        ]
      };

      return NextResponse.json(
        { data: overview },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch nonprofit overview" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);