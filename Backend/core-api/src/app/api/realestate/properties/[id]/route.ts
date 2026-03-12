/**
 * Individual Property API Routes
 * GET /api/realestate/properties/[id] - Get property details
 * PUT /api/realestate/properties/[id] - Update property
 * DELETE /api/realestate/properties/[id] - Delete property
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Property by ID
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id } = await params;
      
      if (!id) {
        return NextResponse.json(
          { error: "Property ID required" },
          { status: 400 }
        );
      }

      const property = await prisma.property.findFirst({
        where: {
          id,
          storeId,
        },
        include: {
          documents: true,
          viewings: {
            where: {
              scheduledAt: {
                gte: new Date(),
              },
            },
            orderBy: {
              scheduledAt: "asc",
            },
          },
          applications: {
            where: {
              status: "pending",
            },
          },
        },
      });

      if (!property) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: property,
      });
    } catch (error: unknown) {
      logger.error("[REAL_ESTATE_PROPERTY_GET]", error, { storeId, propertyId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// PUT Update Property
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id } = await params;
      
      if (!id) {
        return NextResponse.json(
          { error: "Property ID required" },
          { status: 400 }
        );
      }

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
        status,
        featured,
      } = body;

      // Check if property exists and belongs to store
      const existingProperty = await prisma.property.findFirst({
        where: {
          id,
          storeId,
        },
      });

      if (!existingProperty) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      const updatedProperty = await prisma.property.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(type !== undefined && { type }),
          ...(purpose !== undefined && { purpose }),
          ...(price !== undefined && { price: parseFloat(price.toString()) }),
          ...(currency !== undefined && { currency }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(zipCode !== undefined && { zipCode }),
          ...(lat !== undefined && { lat: parseFloat(lat.toString()) }),
          ...(lng !== undefined && { lng: parseFloat(lng.toString()) }),
          ...(bedrooms !== undefined && { bedrooms: parseInt(bedrooms.toString()) }),
          ...(bathrooms !== undefined && { bathrooms: parseInt(bathrooms.toString()) }),
          ...(area !== undefined && { area: parseInt(area.toString()) }),
          ...(yearBuilt !== undefined && { yearBuilt: parseInt(yearBuilt.toString()) }),
          ...(amenities !== undefined && { amenities }),
          ...(images !== undefined && { images }),
          ...(videoUrl !== undefined && { videoUrl }),
          ...(virtualTourUrl !== undefined && { virtualTourUrl }),
          ...(floorPlanUrl !== undefined && { floorPlanUrl }),
          ...(status !== undefined && { status }),
          ...(featured !== undefined && { featured }),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedProperty,
      });
    } catch (error: unknown) {
      logger.error("[REAL_ESTATE_PROPERTY_PUT]", error, { storeId, propertyId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// DELETE Property
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id } = await params;
      
      if (!id) {
        return NextResponse.json(
          { error: "Property ID required" },
          { status: 400 }
        );
      }

      // Check if property exists and belongs to store
      const existingProperty = await prisma.property.findFirst({
        where: {
          id,
          storeId,
        },
      });

      if (!existingProperty) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      // Soft delete by setting status to archived
      const updatedProperty = await prisma.property.update({
        where: { id },
        data: {
          status: "archived",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Property archived successfully",
        data: updatedProperty,
      });
    } catch (error: unknown) {
      logger.error("[REAL_ESTATE_PROPERTY_DELETE]", error, { storeId, propertyId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);