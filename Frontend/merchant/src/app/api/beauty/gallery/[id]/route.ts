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
 * GET /api/beauty/gallery/[id]
 * Get specific photo details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";

    const photo = await prisma.portfolio.findUnique({
      where: {
        id,
        merchantId: storeId,
        type: "GALLERY",
      },
      include: {
        stylist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: photo,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/gallery/[id]",
      operation: "GET_GALLERY_PHOTO",
    });
    return NextResponse.json(
      { error: "Failed to fetch gallery photo" },
      { status: 500 }
    );
  }
}
