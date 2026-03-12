/**
 * CMA Comparables API Route
 * GET /api/realestate/cma/comparables - Get comparable properties
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET CMA Comparables
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const propertyId = searchParams.get("propertyId");
      const limit = parseInt(searchParams.get("limit") || "12");
      const offset = parseInt(searchParams.get("offset") || "0");

      if (!propertyId) {
        return NextResponse.json(
          { error: "Property ID required" },
          { status: 400 }
        );
      }

      // Get the reference property
      const referenceProperty = await prisma.property.findFirst({
        where: {
          id: propertyId,
          storeId,
        },
      });

      if (!referenceProperty) {
        return NextResponse.json(
          { error: "Reference property not found" },
          { status: 404 }
        );
      }

      // Find comparable properties
      const comparables = await prisma.property.findMany({
        where: {
          storeId,
          status: "sold",
          city: referenceProperty.city,
          type: referenceProperty.type,
          purpose: referenceProperty.purpose,
          id: { not: propertyId },
          price: {
            gte: referenceProperty.price.toNumber() * 0.6, // Within 40% price range
            lte: referenceProperty.price.toNumber() * 1.4,
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calculate similarity scores for each comparable
      const comparablesWithScores = comparables.map(property => {
        let similarityScore = 100; // Start with perfect score

        // Price similarity (-1 point per 5% difference)
        const priceDiff = Math.abs(
          (property.price.toNumber() - referenceProperty.price.toNumber()) / 
          referenceProperty.price.toNumber()
        );
        similarityScore -= (priceDiff / 0.05) * 1;

        // Bedroom similarity (-5 points per bedroom difference)
        if (property.bedrooms && referenceProperty.bedrooms) {
          const bedroomDiff = Math.abs(property.bedrooms - referenceProperty.bedrooms);
          similarityScore -= bedroomDiff * 5;
        }

        // Bathroom similarity (-3 points per bathroom difference)
        if (property.bathrooms && referenceProperty.bathrooms) {
          const bathroomDiff = Math.abs(property.bathrooms - referenceProperty.bathrooms);
          similarityScore -= bathroomDiff * 3;
        }

        // Area similarity (-0.5 points per 10% area difference)
        if (property.area && referenceProperty.area) {
          const areaDiff = Math.abs(
            (property.area - referenceProperty.area) / referenceProperty.area
          );
          similarityScore -= (areaDiff / 0.1) * 0.5;
        }

        // Year built similarity (-1 point per 5 years difference)
        if (property.yearBuilt && referenceProperty.yearBuilt) {
          const yearDiff = Math.abs(property.yearBuilt - referenceProperty.yearBuilt);
          similarityScore -= (yearDiff / 5) * 1;
        }

        // Location bonus if same neighborhood (+10 points)
        // This would require more detailed location data

        // Ensure score doesn't go below 0
        similarityScore = Math.max(0, Math.round(similarityScore));

        return {
          ...property,
          similarityScore,
          priceDifference: property.price.toNumber() - referenceProperty.price.toNumber(),
          priceDifferencePercent: ((property.price.toNumber() - referenceProperty.price.toNumber()) / 
                                 referenceProperty.price.toNumber()) * 100,
        };
      });

      // Sort by similarity score descending
      comparablesWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

      const total = await prisma.property.count({
        where: {
          storeId,
          status: "sold",
          city: referenceProperty.city,
          type: referenceProperty.type,
          purpose: referenceProperty.purpose,
          id: { not: propertyId },
          price: {
            gte: referenceProperty.price.toNumber() * 0.6,
            lte: referenceProperty.price.toNumber() * 1.4,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: comparablesWithScores,
        meta: {
          total,
          limit,
          offset,
          referenceProperty: {
            id: referenceProperty.id,
            title: referenceProperty.title,
            price: referenceProperty.price.toNumber(),
            bedrooms: referenceProperty.bedrooms,
            bathrooms: referenceProperty.bathrooms,
            area: referenceProperty.area,
            yearBuilt: referenceProperty.yearBuilt,
          }
        },
      });
    } catch (error: unknown) {
      logger.error("[CMA_COMPARABLES_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);