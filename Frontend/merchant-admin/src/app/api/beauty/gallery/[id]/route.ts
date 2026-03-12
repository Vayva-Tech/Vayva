import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * GET /api/beauty/gallery/[id]
 * Get specific photo details
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
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
    } catch (error: unknown) {
      logger.error("[BEAUTY_GALLERY_ID_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to fetch photo" },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/beauty/gallery/[id]
 * Update photo metadata and approval status
 */
export const PUT = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const {
        title,
        description,
        category,
        status,
        stylistId,
        serviceId,
      } = body;

      // Verify photo exists and belongs to store
      const existingPhoto = await prisma.portfolio.findUnique({
        where: {
          id,
          merchantId: storeId,
          type: "GALLERY",
        },
      });

      if (!existingPhoto) {
        return NextResponse.json(
          { error: "Photo not found" },
          { status: 404 }
        );
      }

      const updatedPhoto = await prisma.portfolio.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(category !== undefined && { category }),
          ...(status !== undefined && { status }),
          ...(stylistId !== undefined && { 
            metadata: {
              ...(existingPhoto.metadata as any || {}),
              stylistId,
            } 
          }),
          ...(serviceId !== undefined && { 
            metadata: {
              ...(existingPhoto.metadata as any || {}),
              serviceId,
            } 
          }),
        },
        include: {
          stylist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      logger.info("[BEAUTY_GALLERY_ID_PUT] Photo updated", { 
        portfolioId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: updatedPhoto,
        message: "Photo updated successfully",
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_GALLERY_ID_PUT_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to update photo" },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/beauty/gallery/[id]
 * Delete a photo from the gallery
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      // Verify photo exists and belongs to store
      const existingPhoto = await prisma.portfolio.findUnique({
        where: {
          id,
          merchantId: storeId,
          type: "GALLERY",
        },
      });

      if (!existingPhoto) {
        return NextResponse.json(
          { error: "Photo not found" },
          { status: 404 }
        );
      }

      // Delete from Cloudinary if publicId exists
      if (existingPhoto.imagePublicId && process.env.CLOUDINARY_API_KEY) {
        try {
          await cloudinary.uploader.destroy(existingPhoto.imagePublicId);
        } catch (error) {
          logger.warn("Failed to delete image from Cloudinary", { 
            publicId: existingPhoto.imagePublicId 
          });
        }
      }

      // Delete from database
      await prisma.portfolio.delete({
        where: { id },
      });

      logger.info("[BEAUTY_GALLERY_ID_DELETE] Photo deleted", { 
        portfolioId: id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        message: "Photo deleted successfully",
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_GALLERY_ID_DELETE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to delete photo" },
        { status: 500 }
      );
    }
  }
);
