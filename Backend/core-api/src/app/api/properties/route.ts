import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, AccommodationType } from "@/lib/db";
import { logger } from "@/lib/logger";

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

// GET List Properties
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const type = searchParams.get("type");

      const accommodations = await prisma.accommodationProduct.findMany({
        where: {
          product: {
            storeId,
            ...(status ? { status: status as "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED" } : {}),
          },
          ...(type ? { type: parseAccommodationType(type) } : {}),
        },
        include: {
          product: true,
        },
        orderBy: {
          product: { createdAt: "desc" },
        },
        take: limit,
        skip: offset,
      });

      const total = await prisma.accommodationProduct.count({
        where: {
          product: {
            storeId,
            ...(status ? { status: status as "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED" } : {}),
          },
          ...(type ? { type: parseAccommodationType(type) } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        data: accommodations,
        meta: {
          total,
          limit,
          offset,
        },
      }, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[PROPERTIES_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 },
      );
    }
  },
);

// POST Create Property (Product + AccommodationProduct)
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, user }) => {
    try {
      const parsedBody: unknown = await request.json().catch(() => ({}));
      const data = isRecord(parsedBody) ? parsedBody : {};

      // Transaction approach: Create Product, then AccommodationProduct
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create Base Product
        const product = await tx.product.create({
          data: {
            storeId,
            title: getString(data.title) || "Untitled Property",
            handle:
              String(data.title || "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "") || `property-${Date.now()}`,
            description: getString(data.description),
            price: data.price ? parseFloat(String(data.price)) : 0,
            productType: "ACCOMMODATION",
            status: "ACTIVE",
          },
        });
        // 2. Create Accommodation Detail
        await tx.accommodationProduct.create({
          data: {
            productId: product.id,
            type: parseAccommodationType(data.type) || "ROOM",
            maxGuests: Number(data.maxGuests) || 1,
            bedCount: Number(data.bedCount) || 1,
            bathrooms: Number(data.bathrooms) || 1,
            totalUnits: Number(data.totalUnits) || 1,
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
          },
        });
        return product;
      });
      return NextResponse.json(result);
    } catch (error: unknown) {
      logger.error("[PROPERTY_CREATE_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 400 },
      );
    }
  },
);
