import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/properties - Get properties with filters
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const type = searchParams.get("type");
      const purpose = searchParams.get("purpose");
      const city = searchParams.get("city");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const limit = parseInt(searchParams.get("limit") || "50");
      const page = parseInt(searchParams.get("page") || "1");

      const where: any = { storeId };

      if (status) where.status = status;
      if (type) where.type = type;
      if (purpose) where.purpose = purpose;
      if (city) where.city = city;
      
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          include: {
            viewings: {
              select: {
                id: true,
                scheduledAt: true,
                status: true
              }
            },
            documents: {
              select: {
                id: true,
                title: true,
                type: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit
        }),
        prisma.property.count({ where })
      ]);

      return NextResponse.json({
        success: true,
        data: {
          properties,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[PROPERTIES_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch properties" },
        { status: 500 }
      );
    }
  }
);

// POST /api/realestate/properties - Create a new property
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
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
        agentId
      } = body;

      // Validation
      if (!title || !description || !price || !address || !city || !state || !agentId) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
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
          price,
          currency: currency || "USD",
          address,
          city,
          state,
          zipCode,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          bedrooms,
          bathrooms,
          area,
          yearBuilt,
          amenities: amenities || [],
          images: images || [],
          videoUrl,
          virtualTourUrl,
          floorPlanUrl,
          agentId,
          status: 'available',
          featured: false
        }
      });

      return NextResponse.json({
        success: true,
        data: property,
        message: "Property created successfully"
      });
    } catch (error: unknown) {
      logger.error("[PROPERTY_CREATE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to create property" },
        { status: 500 }
      );
    }
  }
);
