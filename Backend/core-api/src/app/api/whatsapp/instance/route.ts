import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { WhatsappManager } from "@/services/whatsapp/manager.server";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req, { storeId }) => {
    try {
      const instanceName = `merchant_${storeId}`;
      const result = await WhatsappManager.createInstance(instanceName);
      return NextResponse.json(result);
    } catch (error: unknown) {
      logger.error("[WHATSAPP_INSTANCE_POST]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const GET = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req, { storeId }) => {
    try {
      const instanceName = `merchant_${storeId}`;
      // Connect/Fetch QR
      const result = await WhatsappManager.connectInstance(instanceName);
      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[WHATSAPP_INSTANCE_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
