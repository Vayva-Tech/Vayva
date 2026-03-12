import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      // Fetch incident from DB
      const incident = await prisma.rescueIncident.findFirst({
        where: { id, storeId },
      });

      if (!incident) {
        return NextResponse.json(
          { error: "Incident not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { success: true, data: incident },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[RESCUE_INCIDENT_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
