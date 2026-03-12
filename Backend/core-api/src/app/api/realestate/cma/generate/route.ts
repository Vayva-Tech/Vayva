/**
 * CMA Generate API Route
 * POST /api/realestate/cma/generate - Generate CMA report
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// POST Generate CMA Report
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const { 
        propertyId, 
        config,
        marketConditions,
        notes 
      } = body;

      if (!propertyId) {
        return NextResponse.json(
          { error: "Property ID is required" },
          { status: 400 }
        );
      }

      // Get property data
      const property = await prisma.property.findFirst({
        where: { 
          id: propertyId, 
          storeId 
        },
      });

      if (!property) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      // Get comparable listings (sold properties in same area)
      const comparables = await prisma.property.findMany({
        where: {
          storeId,
          status: "sold",
          city: property.city,
          type: property.type,
          purpose: property.purpose,
          id: { not: propertyId },
          price: {
            gte: property.price.toNumber() * 0.7, // Within 30% price range
            lte: property.price.toNumber() * 1.3,
          },
        },
        take: 12,
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calculate CMA metrics
      const prices = comparables.map(p => p.price.toNumber());
      const avgPrice = prices.length > 0 
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
        : property.price.toNumber();
      
      const pricePerSqft = property.area ? avgPrice / property.area : 0;
      
      // Adjust based on property specifics
      let adjustedValue = avgPrice;
      
      // Bedrooms adjustment (+/- 5% per bedroom difference)
      if (property.bedrooms && comparables.length > 0) {
        const avgBedrooms = comparables.reduce((sum, p) => sum + (p.bedrooms || 0), 0) / comparables.length;
        const bedroomDiff = (property.bedrooms - avgBedrooms) * 0.05;
        adjustedValue = adjustedValue * (1 + bedroomDiff);
      }
      
      // Bathrooms adjustment (+/- 3% per bathroom difference)
      if (property.bathrooms && comparables.length > 0) {
        const avgBathrooms = comparables.reduce((sum, p) => sum + (p.bathrooms || 0), 0) / comparables.length;
        const bathroomDiff = (property.bathrooms - avgBathrooms) * 0.03;
        adjustedValue = adjustedValue * (1 + bathroomDiff);
      }

      // Area adjustment
      if (property.area && comparables.length > 0) {
        const avgArea = comparables.reduce((sum, p) => sum + (p.area || 0), 0) / comparables.length;
        const areaDiff = ((property.area - avgArea) / avgArea) * 0.1; // 10% per 10% area difference
        adjustedValue = adjustedValue * (1 + areaDiff);
      }

      // Age adjustment (-1% per year older than average)
      if (property.yearBuilt && comparables.length > 0) {
        const avgYear = comparables.reduce((sum, p) => sum + (p.yearBuilt || 2020), 0) / comparables.length;
        const ageDiff = property.yearBuilt - avgYear;
        if (ageDiff < 0) { // Property is newer
          adjustedValue = adjustedValue * (1 - (Math.abs(ageDiff) * 0.01));
        }
      }

      // Amenities premium (5% for each premium amenity)
      const premiumAmenities = ["pool", "garage", "garden", "security", "gym"];
      const propertyAmenities = property.amenities || [];
      const premiumCount = propertyAmenities.filter(amenity => 
        premiumAmenities.includes(amenity.toLowerCase())
      ).length;
      adjustedValue = adjustedValue * (1 + (premiumCount * 0.05));

      // Market condition adjustment
      let marketAdjustment = 0;
      if (marketConditions === "hot") marketAdjustment = 0.05; // +5%
      if (marketConditions === "cold") marketAdjustment = -0.05; // -5%

      adjustedValue = adjustedValue * (1 + marketAdjustment);

      // Confidence score based on comparable count
      const confidenceScore = Math.min(100, Math.max(30, comparables.length * 8));

      // Create CMA report
      const cmaReport = await prisma.cMAReport.create({
        data: {
          merchantId: storeId,
          agentId: user.id,
          propertyId,
          estimatedValue: adjustedValue,
          valueRangeLow: adjustedValue * 0.92, // +/- 8%
          valueRangeHigh: adjustedValue * 1.08,
          valueRecommended: adjustedValue,
          pricePerSqft: pricePerSqft,
          confidenceScore: confidenceScore,
          daysOnMarketEstimate: 45, // Default estimate
          comparablesCount: comparables.length,
          marketConditions: marketConditions || "stable",
          notes,
          config: config || {},
        },
      });

      // Link comparables to report
      if (comparables.length > 0) {
        await Promise.all(
          comparables.slice(0, 6).map(comp => 
            prisma.comparableProperty.create({
              data: {
                cmaReportId: cmaReport.id,
                propertyId: comp.id,
                similarityScore: 85, // TODO: Calculate actual similarity
              },
            })
          )
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          report: cmaReport,
          comparables: comparables.slice(0, 6),
          analysis: {
            averageComparablePrice: avgPrice,
            pricePerSquareFoot: pricePerSqft,
            confidenceScore: confidenceScore,
            adjustments: {
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              area: property.area,
              yearBuilt: property.yearBuilt,
              amenitiesCount: premiumCount,
            }
          }
        },
      });
    } catch (error: unknown) {
      logger.error("[CMA_GENERATE_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);