import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/beauty/services - Get beauty services
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get("category");
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const page = parseInt(searchParams.get("page") || "1");

      const where: any = { merchantId: storeId };

      if (category) where.category = category;
      if (status) where.status = status;

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            duration: true,
            price: true,
            status: true,
            imageUrl: true,
            _count: {
              select: {
                bookings: true
              }
            }
          },
          orderBy: { category: 'asc' },
          take: limit,
          skip: (page - 1) * limit
        }),
        prisma.service.count({ where })
      ]);

      return NextResponse.json({
        success: true,
        data: {
          services,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_SERVICES_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch services" },
        { status: 500 }
      );
    }
  }
);

// POST /api/beauty/services - Create beauty service
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        name,
        description,
        category,
        duration,
        price,
        imageUrl,
        metadata
      } = body;

      if (!name || !price || !duration) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      const service = await prisma.service.create({
        data: {
          merchantId: storeId,
          name,
          description,
          category: category || 'general',
          duration,
          price,
          imageUrl,
          metadata: metadata ? JSON.stringify(metadata) : null,
          status: 'active'
        }
      });

      return NextResponse.json({
        success: true,
        data: service,
        message: "Service created successfully"
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_SERVICE_CREATE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to create service" },
        { status: 500 }
      );
    }
  }
);
