import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { getIntegrationHealth } from "@/lib/integration-health";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req, { storeId }) => {
    try {
      const health = await getIntegrationHealth(storeId);
      const whatsappHealth = health["whatsapp"] as
        | { status?: string }
        | undefined;
      const status = whatsappHealth?.status || "UNKNOWN";

      return NextResponse.json({ status });
    } catch (error: unknown) {
      logger.error("[SETTINGS_WHATSAPP_POST]", error, { storeId });
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  },
);
