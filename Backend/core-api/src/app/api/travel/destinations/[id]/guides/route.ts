import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const GuideQuerySchema = z.object({
  type: z
    .enum([
      "overview",
      "attractions",
      "restaurants",
      "transportation",
      "tips",
    ])
    .optional(),
  language: z.string().default("en"),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const { searchParams } = new URL(req.url);

      const parseResult = GuideQuerySchema.safeParse(
        Object.fromEntries(searchParams),
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { type } = parseResult.data;

      const destination = await prisma.travelDestination.findFirst({
        where: { id, storeId },
      });

      if (!destination) {
        return NextResponse.json(
          { error: "Destination not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const guides: Record<string, unknown> = {};

      if (!type || type === "overview") {
        guides.overview = {
          title: `${destination.name} Travel Guide`,
          introduction:
            destination.description ||
            `Discover the beauty of ${destination.name}`,
          highlights: JSON.parse(destination.highlights || "[]"),
          bestTimeToVisit: destination.bestTimeToVisit,
          language: destination.language,
          currency: destination.currency,
          timezone: destination.timezone,
        };
      }

      if (!type || type === "attractions") {
        guides.attractions = {
          title: `Top Attractions in ${destination.name}`,
          attractions: [
            {
              name: `Must-see places in ${destination.region}`,
              description: `Explore the most popular attractions and landmarks in ${destination.name}`,
              category: "Landmarks",
            },
            {
              name: `Local culture and heritage`,
              description: `Experience authentic local traditions and cultural sites`,
              category: "Culture",
            },
          ],
        };
      }

      if (!type || type === "restaurants") {
        guides.restaurants = {
          title: `Best Restaurants in ${destination.name}`,
          restaurants: [
            {
              name: "Local Favorites",
              cuisine: "Regional specialties",
              priceRange: "$$",
              recommendations: `Popular local dishes and dining experiences`,
            },
          ],
        };
      }

      if (!type || type === "transportation") {
        guides.transportation = {
          title: `Getting Around ${destination.name}`,
          options: [
            {
              mode: "Public Transport",
              description: "Local buses, trains, and metro systems",
            },
            {
              mode: "Taxis/Rideshare",
              description: "Convenient door-to-door transportation",
            },
          ],
        };
      }

      if (!type || type === "tips") {
        guides.tips = {
          title: `Travel Tips for ${destination.name}`,
          tips: [
            {
              category: "Local Customs",
              advice: "Learn about local etiquette and customs",
            },
            {
              category: "Safety",
              advice: "Stay aware of local safety guidelines",
            },
            {
              category: "Weather",
              advice: `Check seasonal weather patterns for ${destination.name}`,
            },
          ],
        };
      }

      return NextResponse.json(
        {
          data: {
            destinationId: id,
            destinationName: destination.name,
            guides,
            generatedAt: new Date().toISOString(),
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: destinationId } = await params;
      logger.error("[TRAVEL_DESTINATION_GUIDES_GET]", { error, destinationId });
      return NextResponse.json(
        { error: "Failed to fetch destination guides" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
