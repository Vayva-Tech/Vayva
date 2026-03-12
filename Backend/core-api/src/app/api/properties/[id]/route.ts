import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, AccommodationType } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseAccommodationType(value: unknown): AccommodationType | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toUpperCase();
  return (Object.values(AccommodationType) as string[]).includes(normalized)
    ? (normalized as AccommodationType)
    : undefined;
}

// GET Property by ID
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const accommodation = await prisma.accommodationProduct.findUnique({
        where: { id: id },
        include: { product: true },
      });
      if (!accommodation || accommodation.product.storeId !== storeId) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(accommodation, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[PROPERTY_GET_BY_ID]", error, { storeId, propertyId: id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 400 },
      );
    }
  },
);

// PUT Update Property
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, params, user }) => {
    const { id: accommodationId } = await params;
    try {
      if (!accommodationId)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const parsedBody: unknown = await request.json().catch(() => ({}));
      const data = isRecord(parsedBody) ? parsedBody : {};

      // Resolve IDs. The ID passed is likely the AccommodationProduct ID, but we need to update generic Product too.
      const accommodation = await prisma.accommodationProduct.findUnique({
        where: { id: accommodationId },
        include: { product: true },
      });
      if (!accommodation || accommodation.product.storeId !== storeId) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 },
        );
      }
      // Transaction update
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update Base Product & Images
        await tx.product.update({
          where: { id: accommodation.productId },
          data: {
            title: getString(data.title) || undefined,
            description: getString(data.description) || undefined,
            price: data.price ? parseFloat(String(data.price)) : undefined,
            productImages: Array.isArray(data.images)
              ? {
                  deleteMany: {},
                  createMany: {
                    data: data.images.map((url: string, index: number) => ({
                      url: String(url),
                      position: index,
                    })),
                  },
                }
              : undefined,
          },
        });
        // 2. Update Accommodation Detail
        return await tx.accommodationProduct.update({
          where: { id: accommodationId },
          data: {
            type: parseAccommodationType(data.type),
            maxGuests: Number(data.maxGuests) || undefined,
            bedCount: Number(data.bedCount) || undefined,
            bathrooms: Number(data.bathrooms) || undefined,
            totalUnits: Number(data.totalUnits) || undefined,
            amenities: Array.isArray(data.amenities)
              ? data.amenities
              : undefined,
          },
          include: { product: true },
        });
      });
      return NextResponse.json(result);
    } catch (error: unknown) {
      logger.error("[PROPERTY_UPDATE_PUT]", error, {
        storeId,
        propertyId: accommodationId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 400 },
      );
    }
  },
);

// DELETE Property
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      // Verify ownership
      const accommodation = await prisma.accommodationProduct.findUnique({
        where: { id: id },
        include: { product: true },
      });
      if (!accommodation || accommodation.product.storeId !== storeId) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 },
        );
      }
      // Delete Base Product (Cascade will delete AccommodationProduct)
      await prisma.product.delete({
        where: { id: accommodation.productId },
      });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[PROPERTY_DELETE_BY_ID]", error, {
        storeId,
        propertyId: id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 400 },
      );
    }
  },
);
