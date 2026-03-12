import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const settings = await prisma.whatsAppAgentSettings.findUnique({
        where: { storeId },
      });
      return NextResponse.json(
        { success: true, data: settings },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[SELLER_AI_WHATSAPP_SETTINGS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch WhatsApp settings" },
        { status: 500 },
      );
    }
  },
);

export const PUT = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const settings = await prisma.whatsAppAgentSettings.upsert({
        where: { storeId },
        update: {
          ...body,
          updatedAt: new Date(),
        },
        create: {
          ...body,
          storeId,
        },
      });
      return NextResponse.json({ success: true, data: settings });
    } catch (error) {
      logger.error("[SELLER_AI_WHATSAPP_SETTINGS_PUT]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update WhatsApp settings" },
        { status: 500 },
      );
    }
  },
);
