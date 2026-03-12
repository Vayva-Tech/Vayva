import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { AccommodationType, prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function clampAccommodationType(
  raw: string | undefined,
): AccommodationType | undefined {
  if (!raw) return undefined;
  const normalized = raw.trim().toUpperCase();
  const valid: Record<string, AccommodationType> = {
    ROOM: AccommodationType.ROOM,
    SUITE: AccommodationType.SUITE,
    VILLA: AccommodationType.VILLA,
    APARTMENT: AccommodationType.APARTMENT,
    HOSTEL_BED: AccommodationType.HOSTEL_BED,
    CAMP_SITE: AccommodationType.CAMP_SITE,
  };
  return valid[normalized];
}

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const stay = await prisma.product.findFirst({
        where: {
          id,
          storeId,
          productType: "ACCOMMODATION",
        },
        include: {
          productImages: { orderBy: { position: "asc" } },
          accommodationProduct: true,
        },
      });

      if (!stay) {
        return NextResponse.json({ error: "Stay not found" }, { status: 404 });
      }

      return NextResponse.json(
        { stay },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[STAYS_ID_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const body: unknown = await req.json().catch(() => ({}));
      const b = isRecord(body) ? body : {};

      const title = getOptionalString(b.title);
      const description = getOptionalString(b.description);
      const price = getOptionalNumber(b.price);
      const status = getOptionalString(b.status);
      const type = clampAccommodationType(getOptionalString(b.type));
      const maxGuests = getOptionalNumber(b.maxGuests);
      const bedCount = getOptionalNumber(b.bedCount);
      const bathrooms = getOptionalNumber(b.bathrooms);
      const totalUnits = getOptionalNumber(b.totalUnits);
      const amenities = Array.isArray(b.amenities) ? b.amenities : undefined;

      const existing = await prisma.product.findFirst({
        where: {
          id,
          storeId,
          productType: "ACCOMMODATION",
        },
      });

      if (!existing) {
        return NextResponse.json({ error: "Stay not found" }, { status: 404 });
      }

      const stay = await prisma.product.update({
        where: { id },
        data: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          price: price !== undefined ? price : undefined,
          status: status !== undefined ? (status as "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED") : undefined,
          accommodationProduct: {
            update: {
              type: type !== undefined ? type : undefined,
              maxGuests: maxGuests !== undefined ? maxGuests : undefined,
              bedCount: bedCount !== undefined ? bedCount : undefined,
              bathrooms: bathrooms !== undefined ? bathrooms : undefined,
              totalUnits: totalUnits !== undefined ? totalUnits : undefined,
              amenities: amenities !== undefined ? amenities : undefined,
            },
          },
        },
        include: {
          accommodationProduct: true,
          productImages: true,
        },
      });

      return NextResponse.json({ stay });
    } catch (error: unknown) {
      logger.error("[STAYS_ID_PATCH]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const existing = await prisma.product.findFirst({
        where: {
          id,
          storeId,
          productType: "ACCOMMODATION",
        },
      });

      if (!existing) {
        return NextResponse.json({ error: "Stay not found" }, { status: 404 });
      }

      await prisma.product.delete({
        where: { id },
      });

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[STAYS_ID_DELETE]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
