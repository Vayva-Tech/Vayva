import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function generateId(): string {
  return `cal_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params }) => {
    try {
      const { id } = await params;
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const name = (getString(body.name) || "").trim();
      const url = (getString(body.url) || "").trim();

      if (!name || !url) {
        return NextResponse.json(
          { error: "name and url are required" },
          { status: 400 },
        );
      }

      if (!/^https?:\/\//i.test(url)) {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }

      const product = await prisma.product.findFirst({
        where: { id, storeId },
        select: { id: true, metadata: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      const metadata = (product.metadata as Record<string, unknown>) || {};
      const existing = Array.isArray(metadata.calendarSyncs)
        ? metadata.calendarSyncs
        : [];

      const newSync = {
        id: generateId(),
        name,
        url,
        lastSyncedAt: null,
        syncStatus: "PENDING",
        error: null,
        createdAt: new Date().toISOString(),
      };

      await prisma.product.update({
        where: { id },
        data: {
          metadata: {
            ...metadata,
            calendarSyncs: [...existing, newSync],
          },
        },
      });

      return NextResponse.json(newSync, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      logger.error("[PRODUCT_CALENDAR_SYNC_POST]", error);
      return NextResponse.json(
        { error: "Failed to add calendar sync" },
        { status: 500 },
      );
    }
  },
);
