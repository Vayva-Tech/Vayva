import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

// Main travel route - serves as entry point and overview
export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Return travel industry overview and available endpoints
      const overview = {
        industry: "Travel",
        description: "Travel booking and itinerary management system",
        endpoints: {
          bookings: "/api/travel/bookings",
          packages: "/api/travel/packages", 
          itineraries: "/api/travel/itineraries",
          destinations: "/api/travel/destinations",
          suppliers: "/api/travel/suppliers",
          commissions: "/api/travel/commissions",
          reviews: "/api/travel/reviews"
        },
        features: [
          "Booking management",
          "Package deals",
          "Itinerary builder",
          "Destination content",
          "Supplier integration",
          "Commission tracking",
          "Review management"
        ]
      };

      return NextResponse.json(
        { data: overview },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[TRAVEL_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch travel overview" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);