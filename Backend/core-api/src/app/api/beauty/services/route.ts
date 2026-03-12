/**
 * Beauty Services API Routes
 * GET /api/beauty/services - List services
 * POST /api/beauty/services - Create service
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Services
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "100");
      const offset = parseInt(searchParams.get("offset") || "0");
      const category = searchParams.get("category"); // hair, nails, skincare, makeup, massage
      const isActive = searchParams.get("isActive"); // true/false

      const services = await prisma.beautyService.findMany({
        where: {
          merchantId: storeId,
          ...(category ? { category } : {}),
          ...(isActive !== null ? { isActive: isActive === "true" } : {}),
        },
        orderBy: [
          { category: "asc" },
          { name: "asc" },
        ],
        take: limit,
        skip: offset,
      });

      const total = await prisma.beautyService.count({
        where: {
          merchantId: storeId,
          ...(category ? { category } : {}),
          ...(isActive !== null ? { isActive: isActive === "true" } : {}),
        },
      });

      // Add popularity metrics
      const servicesWithMetrics = await Promise.all(services.map(async (service) => {
        const appointmentCount = await prisma.beautyAppointment.count({
          where: {
            merchantId: storeId,
            serviceId: service.id,
            status: "completed",
          },
        });

        const revenue = await prisma.beautyAppointment.aggregate({
          where: {
            merchantId: storeId,
            serviceId: service.id,
            status: "completed",
          },
          _sum: {
            price: true,
          },
        });

        const avgDuration = service.duration;
        const profitMargin = service.cost > 0 
          ? Math.round(((service.price - service.cost) / service.price) * 100)
          : 100;

        return {
          ...service,
          appointmentCount,
          totalRevenue: revenue._sum.price || 0,
          avgDuration,
          profitMargin,
          isPopular: appointmentCount >= 10,
          isHighValue: service.price >= 100,
        };
      }));

      // Group by category for easier frontend consumption
      const groupedByCategory = servicesWithMetrics.reduce((acc, service) => {
        if (!acc[service.category]) {
          acc[service.category] = [];
        }
        acc[service.category].push(service);
        return acc;
      }, {} as Record<string, typeof servicesWithMetrics>);

      return NextResponse.json({
        success: true,
        data: {
          services: servicesWithMetrics,
          groupedByCategory,
          categories: Object.keys(groupedByCategory),
        },
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_SERVICES_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Service
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId }) => {
    try {
      const body = await request.json();
      const {
        name,
        category,
        duration,
        price,
        cost,
        description,
        requiresConsultation,
      } = body;

      // Validation
      if (!name || !category || !duration || price === undefined) {
        return NextResponse.json(
          { error: "Name, category, duration, and price are required" },
          { status: 400 }
        );
      }

      // Validate category
      const validCategories = ["hair", "nails", "skincare", "makeup", "massage"];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
          { status: 400 }
        );
      }

      // Check if service already exists
      const existingService = await prisma.beautyService.findFirst({
        where: {
          merchantId: storeId,
          name: { equals: name, mode: "insensitive" },
          category,
        },
      });

      if (existingService) {
        return NextResponse.json(
          { error: "Service with this name already exists in this category" },
          { status: 409 }
        );
      }

      const service = await prisma.beautyService.create({
        data: {
          merchantId: storeId,
          name,
          category,
          duration,
          price,
          cost: cost || 0,
          description,
          requiresConsultation: requiresConsultation || false,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: service,
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_SERVICES_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);