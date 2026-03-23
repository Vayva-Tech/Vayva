// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
// Cloudinary is optional — only used when configured
let cloudinary: any = null;
try {
  const mod = require("cloudinary");
  cloudinary = mod.v2;
  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
} catch {
  // cloudinary not installed — upload features will be disabled
}

/**
 * GET /api/beauty/gallery
 * Get all gallery photos with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = request.headers.get("x-store-id") || "";
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "approved";
    const stylistId = searchParams.get("stylistId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const where: any = {
      merchantId: storeId,
      type: "GALLERY",
    };

    if (category) {
      where.category = category;
    }

    if (stylistId) {
      where.metadata = {
        path: ["stylistId"],
        equals: stylistId,
      };
    }

    if (status) {
      where.status = status;
    }

    const [photos, total] = await Promise.all([
      prisma.portfolio.findMany({
        where,
        include: {
          stylist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.portfolio.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        photos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/gallery",
      operation: "GET_GALLERY",
    });
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}
