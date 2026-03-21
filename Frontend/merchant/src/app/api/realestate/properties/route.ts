import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
// GET /api/realestate/properties - Get properties with filters
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
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
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/realestate/properties",
      operation: "GET_PROPERTIES",
    });
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
