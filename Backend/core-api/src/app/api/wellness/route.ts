import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma as _prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z as _z } from "zod";

// Main wellness route - serves as entry point and overview
export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Return wellness industry overview and available endpoints
      const overview = {
        industry: "Wellness",
        description: "Fitness centers, spas, wellness clinics, and health coaching services",
        endpoints: {
          memberships: "/api/wellness/memberships",
          sessions: "/api/wellness/sessions", 
          instructors: "/api/wellness/instructors",
          equipment: "/api/wellness/equipment",
          appointments: "/api/wellness/appointments",
          programs: "/api/wellness/programs",
          reviews: "/api/wellness/reviews",
          analytics: "/api/wellness/analytics"
        },
        features: [
          "Membership management",
          "Class scheduling",
          "Instructor management",
          "Equipment tracking",
          "Appointment booking",
          "Wellness programs",
          "Client reviews",
          "Performance analytics"
        ]
      };

      return NextResponse.json(
        { data: overview },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch wellness overview" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);