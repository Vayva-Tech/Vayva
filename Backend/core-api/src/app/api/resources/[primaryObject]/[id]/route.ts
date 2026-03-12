import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

const ALLOWED_TYPES = [
  "service",
  "campaign",
  "listing",
  "course",
  "post",
  "stay",
  "event",
  "digital_asset",
  "menu_item",
  "project",
  "vehicle",
  "lead",
];
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { params, storeId }) => {
    try {
      const { primaryObject, id } = await params;
      if (!ALLOWED_TYPES.includes(primaryObject)) {
        return NextResponse.json(
          { error: "Invalid resource type" },
          { status: 400 },
        );
      }
      const resource = await prisma.product.findFirst({
        where: { id, storeId, productType: primaryObject },
      });
      if (!resource) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const metadata = getObject(resource.metadata);
      const responseData = {
        ...metadata,
        id: resource.id,
        title: resource.title,
        name: resource.title,
        description: resource.description,
        price: Number(resource.price),
        status: resource.status,
        handle: resource.handle,
      };
      return NextResponse.json(responseData, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[RESOURCE_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { params, storeId }) => {
    try {
      const { primaryObject, id } = await params;
      const body = getObject(await req.json().catch(() => ({})));
      if (!ALLOWED_TYPES.includes(primaryObject)) {
        return NextResponse.json(
          { error: "Invalid resource type" },
          { status: 400 },
        );
      }
      // Verify ownership and type first
      const existing = await prisma.product.findFirst({
        where: { id, storeId, productType: primaryObject },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const { name, title, description, price, ...otherFields } = body;
      // Merge metadata
      const currentMetadata = getObject(existing.metadata);
      const newMetadata = { ...currentMetadata, ...otherFields };
      const updated = await prisma.product.update({
        where: { id },
        data: {
          title: getString(title) || getString(name) || existing.title,
          description:
            description !== undefined
              ? String(description)
              : existing.description,
          price:
            price !== undefined ? parseFloat(String(price)) : existing.price,
          metadata: newMetadata as Prisma.InputJsonValue,
        },
      });
      return NextResponse.json({ success: true, id: updated.id });
    } catch (error: unknown) {
      logger.error("[RESOURCE_PATCH]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
