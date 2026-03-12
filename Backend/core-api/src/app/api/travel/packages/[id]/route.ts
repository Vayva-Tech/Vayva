import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const PackageUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  destination: z.string().min(1).optional(),
  duration: z.number().int().min(1).optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  supplierId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  maxTravelers: z.number().int().min(1).optional(),
  minTravelers: z.number().int().min(1).optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const travelPackage = await prisma.travelPackage.findFirst({
      where: { id, storeId },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
            rating: true,
            reviews: {
              select: {
                rating: true,
                comment: true,
              },
              take: 5,
            },
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            travelDate: true,
            totalPrice: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!travelPackage) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Parse JSON fields
    const packageWithParsedData = {
      ...travelPackage,
      includes: JSON.parse(travelPackage.includes || "[]"),
      excludes: JSON.parse(travelPackage.excludes || "[]"),
      highlights: JSON.parse(travelPackage.highlights || "[]"),
    };

    return NextResponse.json(
      { data: packageWithParsedData },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[TRAVEL_PACKAGE_GET]", { error, packageId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch package" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext & { params: { id: string } }) => {
    const requestId = correlationId;
    try {
      const { id } = params;
      const json = await req.json().catch(() => ({}));
      const parseResult = PackageUpdateSchema.safeParse(json);

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

      // Check if package exists
      const existingPackage = await prisma.travelPackage.findFirst({
        where: { id, storeId },
      });

      if (!existingPackage) {
        return NextResponse.json(
          { error: "Package not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

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

      const updateData: any = {};
      if (body.name) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.destination) updateData.destination = body.destination;
      if (body.duration) updateData.duration = body.duration;
      if (body.price) updateData.price = body.price;
      if (body.currency) updateData.currency = body.currency;
      if (body.includes) updateData.includes = JSON.stringify(body.includes);
      if (body.excludes) updateData.excludes = JSON.stringify(body.excludes);
      if (body.highlights) updateData.highlights = JSON.stringify(body.highlights);
      if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
      if (body.supplierId) updateData.supplierId = body.supplierId;
      if (body.startDate) updateData.startDate = new Date(body.startDate);
      if (body.endDate) updateData.endDate = new Date(body.endDate);
      if (body.maxTravelers) updateData.maxTravelers = body.maxTravelers;
      if (body.minTravelers) updateData.minTravelers = body.minTravelers;
      if (body.status) updateData.status = body.status;

      const travelPackage = await prisma.travelPackage.update({
        where: { id },
        data: updateData,
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
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[TRAVEL_PACKAGE_PUT]", { error, packageId: params.id, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to update package" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);