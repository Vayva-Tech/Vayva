import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId, params }) => {
    try {
      const { id: collectionId } = await params;
      const collection = await prisma.collection.findFirst({
        where: { id: collectionId, storeId },
        include: { _count: { select: { collectionProducts: true } } },
      });
      if (!collection) {
        return NextResponse.json(
          { error: "Collection not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { success: true, data: collection },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[COLLECTION_GET_BY_ID]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params }) => {
    try {
      const { id: collectionId } = await params;
      const deleted = await prisma.collection.deleteMany({
        where: { id: collectionId, storeId },
      });
      if (deleted.count === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error("[COLLECTION_DELETE]", error, { storeId });
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
  },
);
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_EDIT,
  async (req, { storeId, params }) => {
    try {
      const { id: collectionId } = await params;
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const title = getString(body.title);
      const description = getString(body.description);
      const handle = getString(body.handle);

      const updated = await prisma.collection.updateMany({
        where: { id: collectionId, storeId },
        data: {
          title,
          description,
          handle: handle
            ? handle.toLowerCase().replace(/\s+/g, "-")
            : undefined,
          updatedAt: new Date(),
        },
      });
      if (updated.count === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const collection = await prisma.collection.findFirst({
        where: { id: collectionId, storeId },
        include: { _count: { select: { collectionProducts: true } } },
      });

      return NextResponse.json({ success: true, data: collection });
    } catch (error) {
      logger.error("[COLLECTION_UPDATE]", error, { storeId });
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
  },
);
