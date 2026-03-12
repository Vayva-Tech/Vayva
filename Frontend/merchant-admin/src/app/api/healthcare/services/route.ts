import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/healthcare/services - Get all healthcare services
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const category = searchParams.get("category");

      const where: Record<string, unknown> = { storeId };

      if (status) {
        where.status = status;
      }

      if (category) {
        where.category = category;
      }

      const [services, total] = await Promise.all([
        (prisma as any).healthcareService.findMany({
          where,
          include: {
            providers: {
              select: {
                id: true,
                name: true,
                avatar: true,
                title: true,
              },
            },
            _count: {
              select: {
                appointments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        }),
        (prisma as any).healthcareService.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: services,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + services.length < total,
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_SERVICES_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch services" },
        { status: 500 }
      );
    }
  }
);

// POST /api/healthcare/services - Create a new healthcare service
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        name,
        description,
        category,
        price,
        duration,
        status = "active",
        requiresPreAuth,
        insuranceCodes,
        preparationInstructions,
        followUpInstructions,
      } = body;

      if (!name || !price) {
        return NextResponse.json(
          { success: false, error: "Name and price are required" },
          { status: 400 }
        );
      }

      const service = await (prisma as any).healthcareService.create({
        data: {
          storeId,
          name,
          description,
          category: category || "general",
          price,
          duration: duration || 30,
          status,
          requiresPreAuth: requiresPreAuth || false,
          insuranceCodes: insuranceCodes || [],
          preparationInstructions,
          followUpInstructions,
          createdBy: user.id,
        },
      });

      logger.info("[HEALTHCARE_SERVICE_CREATED]", { serviceId: service.id, storeId });

      return NextResponse.json({
        success: true,
        data: service,
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_SERVICE_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create service" },
        { status: 500 }
      );
    }
  }
);
