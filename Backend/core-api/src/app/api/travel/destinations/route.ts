import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const DestinationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  country: z.string().optional(),
  region: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

const DestinationCreateSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  region: z.string().min(1),
  description: z.string().optional(),
  latitude: z.number().gte(-90).lte(90).optional(),
  longitude: z.number().gte(-180).lte(180).optional(),
  timezone: z.string().optional(),
  currency: z.string().length(3).default("USD"),
  language: z.string().default("en"),
  imageUrl: z.string().url().optional(),
  highlights: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  bestTimeToVisit: z.string().optional(),
  visaRequirements: z.string().optional(),
  featured: z.boolean().default(false),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = DestinationQuerySchema.safeParse(
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

      const { page, limit, country, region, featured, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (country) where.country = { contains: country, mode: "insensitive" };
      if (region) where.region = { contains: region, mode: "insensitive" };
      if (featured !== undefined) where.featured = featured;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { country: { contains: search, mode: "insensitive" } },
          { region: { contains: search, mode: "insensitive" } },
        ];
      }

      const [destinations, total] = await Promise.all([
        prisma.travelDestination.findMany({
          where,
          include: {
            _count: {
              select: {
                packages: { where: { status: "active" } },
                itineraries: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.travelDestination.count({ where }),
      ]);

      // Parse JSON fields
      const destinationsWithParsedData = destinations.map(dest => ({
        ...dest,
        highlights: JSON.parse(dest.highlights || "[]"),
        categories: JSON.parse(dest.categories || "[]"),
      }));

      return NextResponse.json(
        {
          data: destinationsWithParsedData,
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
      logger.error("[TRAVEL_DESTINATIONS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch destinations" },
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
      const parseResult = DestinationCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid destination data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Check for duplicate destination
      const existingDestination = await prisma.travelDestination.findFirst({
        where: {
          name: body.name,
          country: body.country,
          region: body.region,
          storeId,
        },
      });

      if (existingDestination) {
        return NextResponse.json(
          { error: "Destination already exists" },
          { status: 409, headers: standardHeaders(requestId) }
        );
      }

      const destination = await prisma.travelDestination.create({
        data: {
          storeId,
          name: body.name,
          country: body.country,
          region: body.region,
          description: body.description,
          latitude: body.latitude,
          longitude: body.longitude,
          timezone: body.timezone,
          currency: body.currency,
          language: body.language,
          imageUrl: body.imageUrl,
          highlights: JSON.stringify(body.highlights),
          categories: JSON.stringify(body.categories),
          bestTimeToVisit: body.bestTimeToVisit,
          visaRequirements: body.visaRequirements,
          featured: body.featured,
        },
      });

      return NextResponse.json(destination, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[TRAVEL_DESTINATIONS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create destination" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);