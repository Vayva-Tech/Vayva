/**
 * Real Estate Properties API Routes
 * GET /api/realestate/properties - List properties
 * POST /api/realestate/properties - Create property
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

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
      const purpose = searchParams.get("purpose");
      const city = searchParams.get("city");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const bedrooms = searchParams.get("bedrooms");

      const properties = await prisma.property.findMany({
        where: {
          storeId,
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
          ...(purpose ? { purpose } : {}),
          ...(city ? { city } : {}),
          ...(minPrice || maxPrice
            ? {
                price: {
                  ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
                  ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
                },
              }
            : {}),
          ...(bedrooms ? { bedrooms: parseInt(bedrooms) } : {}),
        },
        include: {
          documents: {
            take: 5,
          },
          viewings: {
            where: {
              scheduledAt: {
                gte: new Date(),
              },
            },
            take: 3,
            orderBy: {
              scheduledAt: "asc",
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.property.count({
        where: {
          storeId,
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
          ...(purpose ? { purpose } : {}),
          ...(city ? { city } : {}),
          ...(minPrice || maxPrice
            ? {
                price: {
                  ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
                  ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
                },
              }
            : {}),
          ...(bedrooms ? { bedrooms: parseInt(bedrooms) } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        data: properties,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[REAL_ESTATE_PROPERTIES_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Property
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const {
        title,
        description,
        type,
        purpose,
        price,
        currency,
        address,
        city,
        state,
        zipCode,
        lat,
        lng,
        bedrooms,
        bathrooms,
        area,
        yearBuilt,
        amenities,
        images,
        videoUrl,
        virtualTourUrl,
        floorPlanUrl,
        featured,
        agentId,
      } = body;

      // Validation
      if (!title || !address || !city || !state || !price || !type || !purpose) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const property = await prisma.property.create({
        data: {
          storeId,
          title,
          description,
          type,
          purpose,
          price: parseFloat(price.toString()),
          currency: currency || "NGN",
          address,
          city,
          state,
          zipCode,
          lat: lat ? parseFloat(lat.toString()) : undefined,
          lng: lng ? parseFloat(lng.toString()) : undefined,
          bedrooms: bedrooms ? parseInt(bedrooms.toString()) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms.toString()) : undefined,
          area: area ? parseInt(area.toString()) : undefined,
          yearBuilt: yearBuilt ? parseInt(yearBuilt.toString()) : undefined,
          amenities: amenities || [],
          images: images || [],
          videoUrl,
          virtualTourUrl,
          floorPlanUrl,
          status: "available",
          featured: featured || false,
          agentId: agentId || user.id,
        },
      });

      return NextResponse.json({
        success: true,
        data: property,
      });
    } catch (error: unknown) {
      logger.error("[REAL_ESTATE_PROPERTIES_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);