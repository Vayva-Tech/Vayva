import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (_req, { storeId, params }) => {
    try {
      const { id } = await params;

      const products = await prisma.product.findMany({
        where: { storeId },
        select: { id: true, metadata: true },
      });

      const target = products.find((p) => {
        const md = getObject(p.metadata);
        const list = Array.isArray(md.calendarSyncs) ? md.calendarSyncs : [];
        return list.some((s) => s?.id === id);
      });

      if (!target) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const metadata = getObject(target.metadata);
      const existing = Array.isArray(metadata.calendarSyncs)
        ? metadata.calendarSyncs
        : [];
      const next = existing.filter((s) => s?.id !== id);

      await prisma.product.update({
        where: { id: target.id },
        data: {
          metadata: {
            ...metadata,
            calendarSyncs: next,
          },
        },
      });

      return NextResponse.json(
        { success: true },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    } catch (error) {
      logger.error("[CALENDAR_SYNC_DELETE]", error);
      return NextResponse.json(
        { error: "Failed to delete calendar sync" },
        { status: 500 },
      );
    }
  },
);
