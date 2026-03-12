import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { AccommodationType, prisma } from "@vayva/db";

import { logger } from "@/lib/logger";

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

function getOptionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: string[] = [];
  for (const v of value) {
    if (typeof v === "string") out.push(v);
  }
  return out;
}

function clampAccommodationType(raw: string | undefined): AccommodationType {
  if (!raw) return AccommodationType.ROOM;

  const normalized = raw.trim().toUpperCase();
  if (normalized === "ROOM") return AccommodationType.ROOM;
  if (normalized === "SUITE") return AccommodationType.SUITE;
  if (normalized === "VILLA") return AccommodationType.VILLA;
  if (normalized === "APARTMENT") return AccommodationType.APARTMENT;
  if (normalized === "HOSTEL_BED") return AccommodationType.HOSTEL_BED;
  if (normalized === "CAMP_SITE") return AccommodationType.CAMP_SITE;

  return AccommodationType.ROOM;
}

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const type = searchParams.get("type");

      const stays = await prisma.product.findMany({
        where: {
          storeId,
          productType: "ACCOMMODATION",
          ...(status && { status: status as "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED" }),
        },
        include: {
          productImages: { take: 1, orderBy: { position: "asc" } },
          accommodationProduct: true,
        },
        orderBy: { createdAt: "desc" },
      });

      let filtered = stays;
      if (type) {
        filtered = filtered.filter(
          (s) =>
            s.accommodationProduct?.type?.toLowerCase() === type.toLowerCase(),
        );
      }

      return NextResponse.json(
        {
          stays: filtered.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            price: Number(s.price),
            status: s.status,
            image: s.productImages[0]?.url || null,
            type: s.accommodationProduct?.type,
            maxGuests: s.accommodationProduct?.maxGuests,
            bedCount: s.accommodationProduct?.bedCount,
            bathrooms: s.accommodationProduct?.bathrooms,
            totalUnits: s.accommodationProduct?.totalUnits,
            amenities: s.accommodationProduct?.amenities,
            createdAt: s.createdAt,
          })),
          total: filtered.length,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[STAYS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const body: unknown = await req.json().catch(() => ({}));
      const b = isRecord(body) ? body : {};

      const title = getOptionalString(b.title);
      const description = getOptionalString(b.description);
      const price = getOptionalNumber(b.price);
      const type = getOptionalString(b.type);
      const maxGuests = getOptionalNumber(b.maxGuests);
      const bedCount = getOptionalNumber(b.bedCount);
      const bathrooms = getOptionalNumber(b.bathrooms);
      const totalUnits = getOptionalNumber(b.totalUnits);
      const amenities = getOptionalStringArray(b.amenities);
      const images = getOptionalStringArray(b.images);

      if (!title || price === undefined) {
        return NextResponse.json(
          { error: "Title and price are required" },
          { status: 400 },
        );
      }

      const handle = `${title}-${Date.now()}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      const stay = await prisma.product.create({
        data: {
          storeId,
          title,
          description: description || "",
          price,
          handle,
          status: "ACTIVE",
          productType: "ACCOMMODATION",
          accommodationProduct: {
            create: {
              type: clampAccommodationType(type),
              maxGuests: maxGuests ?? 2,
              bedCount: bedCount ?? 1,
              bathrooms: bathrooms ?? 1,
              totalUnits: totalUnits ?? 1,
              amenities: amenities || [],
            },
          },
          productImages: images?.length
            ? {
                create: images.map((url: string, i: number) => ({
                  url,
                  position: i,
                })),
              }
            : undefined,
        },
        include: {
          accommodationProduct: true,
          productImages: true,
        },
      });

      return NextResponse.json({ stay }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[STAYS_POST]", error, { storeId, userId: user.id });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
