import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId }) => {
    try {
      const collections = await prisma.collection.findMany({
        where: { storeId },
        include: {
          _count: {
            select: { collectionProducts: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
      const formatted = collections.map((col) => ({
        id: col.id,
        name: col.title,
        handle: col.handle,
        count: col._count.collectionProducts,
        visibility: "Public", // Default for now
        updated: col.updatedAt.toISOString(),
      }));
      return NextResponse.json(
        {
          success: true,
          data: formatted,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[COLLECTIONS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch collections" },
        { status: 500 },
      );
    }
  },
);
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_EDIT,
  async (req, { storeId }) => {
    try {
      const raw: unknown = await req.json().catch(() => ({}));
      const body = isRecord(raw) ? raw : {};
      const title = typeof body.title === "string" ? body.title : undefined;
      const handle = typeof body.handle === "string" ? body.handle : undefined;
      const description =
        typeof body.description === "string" ? body.description : undefined;
      if (!title || !handle) {
        return NextResponse.json(
          { error: "Title and handle are required" },
          { status: 400 },
        );
      }
      // 1. Check for handle collision within store
      const existing = await prisma.collection.findUnique({
        where: { storeId_handle: { storeId, handle } },
      });
      if (existing) {
        return NextResponse.json(
          {
            error:
              "A collection with this handle already exists in your store.",
          },
          { status: 409 },
        );
      }
      // 2. Create Collection
      const collection = await prisma.collection.create({
        data: {
          storeId,
          title,
          handle: handle.toLowerCase().replace(/\s+/g, "-"),
          description,
        },
      });
      return NextResponse.json({
        success: true,
        data: collection,
      });
    } catch (error) {
      logger.error("[COLLECTIONS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create collection" },
        { status: 500 },
      );
    }
  },
);
