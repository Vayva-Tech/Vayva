import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const GET = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      if (!store)
        return NextResponse.json({ error: "Store not found" }, { status: 404 });

      const settings = isRecord(store.settings) ? store.settings : {};
      const ig = isRecord(settings.instagram) ? settings.instagram : null;

      return NextResponse.json(
        {
          connected: Boolean(ig?.connected),
          account: ig?.pageName || null,
          pageId: ig?.pageId || null,
          igBusinessId: ig?.igBusinessId || null,
          provider: ig?.provider || null,
          connectedAt: ig?.connectedAt || null,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[INSTAGRAM_STATUS_GET]", error, { storeId });
      if (getErrorMessage(error) === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json(
        { error: "Failed to fetch Instagram status" },
        { status: 500 },
      );
    }
  },
);
