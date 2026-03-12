import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const POST = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store)
        return NextResponse.json({ error: "Store not found" }, { status: 404 });

      const settings = isRecord(store.settings) ? store.settings : {};
      const nextSettings = { ...settings };
      nextSettings.instagram = {
        connected: false,
        disconnectedAt: new Date().toISOString(),
      };

      await prisma.store.update({
        where: { id: storeId },
        data: {
          settings: nextSettings,
        },
      });

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[INSTAGRAM_DISCONNECT_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to disconnect Instagram" },
        { status: 500 },
      );
    }
  },
);
