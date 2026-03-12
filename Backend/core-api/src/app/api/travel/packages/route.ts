import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const PackageQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  destination: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
});

const PackageCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  destination: z.string().min(1),
  duration: z.number().int().min(1), // in days
  price: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  includes: z.array(z.string()).default([]),
  excludes: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional(),
  supplierId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  maxTravelers: z.number().int().min(1).default(10),
  minTravelers: z.number().int().min(1).default(1),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = PackageQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, status, destination, minPrice, maxPrice, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (destination) where.destination = { contains: destination, mode: "insensitive" };
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { destination: { contains: search, mode: "insensitive" } },
        ];
      }

      const [packages, total] = await Promise.all([
        prisma.travelPackage.findMany({
          where,
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                rating: true,
              },
            },
            _count: {
              select: {
                bookings: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.travelPackage.count({ where }),
      ]);

      return NextResponse.json(
        {
          data: packages,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[TRAVEL_PACKAGES_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch packages" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = PackageCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid package data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify supplier exists if provided
      if (body.supplierId) {
        const supplier = await prisma.travelSupplier.findFirst({
          where: { id: body.supplierId, storeId },
        });
        
        if (!supplier) {
          return NextResponse.json(
            { error: "Supplier not found" },
            { status: 404, headers: standardHeaders(requestId) }
          );
        }
      }

      const travelPackage = await prisma.travelPackage.create({
        data: {
          storeId,
          name: body.name,
          description: body.description,
          destination: body.destination,
          duration: body.duration,
          price: body.price,
          currency: body.currency,
          includes: JSON.stringify(body.includes),
          excludes: JSON.stringify(body.excludes),
          highlights: JSON.stringify(body.highlights),
          imageUrl: body.imageUrl,
          supplierId: body.supplierId,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          maxTravelers: body.maxTravelers,
          minTravelers: body.minTravelers,
          status: "active",
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              rating: true,
            },
          },
        },
      });

      return NextResponse.json(travelPackage, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[TRAVEL_PACKAGES_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create package" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);