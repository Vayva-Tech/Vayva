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
 * GET /api/beauty/gallery
 * Get all gallery photos with filtering
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
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
    } catch (error: unknown) {
      logger.error("[BEAUTY_GALLERY_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to fetch gallery" },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/beauty/gallery
 * Upload a new photo to the gallery
 */
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const category = formData.get("category") as string;
      const stylistId = formData.get("stylistId") as string;
      const serviceId = formData.get("serviceId") as string;
      const isBeforeAfter = formData.get("isBeforeAfter") === "true";
      const requiresApproval = formData.get("requiresApproval") === "true";

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // Convert File to Buffer for Cloudinary upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      let imageUrl = "";
      let publicId = "";

      if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `beauty/${storeId}/gallery`,
              transformation: [
                { width: 1200, height: 1200, crop: "limit" },
                { quality: "auto:good" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        imageUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      } else {
        // Fallback: use a placeholder URL
        imageUrl = `/api/placeholder?width=800&height=800`;
      }

      // Create portfolio entry
      const portfolio = await prisma.portfolio.create({
        data: {
          merchantId: storeId,
          title: title || "Gallery Photo",
          description: description || "",
          imageUrl,
          imagePublicId: publicId,
          category: category || "general",
          type: "GALLERY",
          status: requiresApproval ? "pending" : "approved",
          metadata: {
            stylistId,
            serviceId,
            isBeforeAfter,
            uploadedAt: new Date(),
          },
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

      logger.info("[BEAUTY_GALLERY_POST] Photo uploaded", { 
        portfolioId: portfolio.id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: portfolio,
        message: "Photo uploaded successfully",
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_GALLERY_POST_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to upload photo" },
        { status: 500 }
      );
    }
  }
);
