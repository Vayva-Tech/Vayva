import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { getIntegrationHealth } from "@/lib/integration-health";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.OPS_VIEW,
  async (req, { storeId }) => {
    try {
      // Ensure env var is set for library logic
      process.env.OPS_INTEGRATION_HEALTH_ENABLED = "true";
      const health = await getIntegrationHealth(storeId);
      return NextResponse.json(
        { health },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[HEALTH_INTEGRATIONS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
