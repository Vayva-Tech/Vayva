/**
 * CMA API Routes
 * POST /api/realestate/cma - Generate CMA report
 * GET /api/realestate/cma - List CMA reports
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Calculate similarity score between subject property and comparable
 * Score: 0-100 (higher = more similar)
 */
function calculateSimilarityScore(subject: any, comparable: any): number {
  let score = 100;
  
  // Property type match (critical)
  if (subject.propertyType !== comparable.propertyType) {
    score -= 40;
  }
  
  // Bedroom difference (max -20 points)
  const bedDiff = Math.abs(subject.bedrooms - (comparable.bedrooms || 0));
  score -= Math.min(20, bedDiff * 5);
  
  // Bathroom difference (max -15 points)
  const bathDiff = Math.abs(subject.bathrooms - (comparable.bathrooms || 0));
  score -= Math.min(15, bathDiff * 4);
  
  // Square footage difference (max -15 points)
  const sqftDiff = Math.abs(subject.squareFeet - (comparable.squareFeet || 0));
  const sqftPercentDiff = subject.squareFeet > 0 ? sqftDiff / subject.squareFeet : 0;
  score -= Math.min(15, sqftPercentDiff * 30);
  
  // Age difference (max -10 points)
  const ageDiff = Math.abs(subject.yearBuilt - (comparable.yearBuilt || 0));
  score -= Math.min(10, ageDiff / 5);
  
  return Math.max(0, score);
}

// POST Generate CMA
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const { propertyId, _config, notes } = body;

      if (!propertyId) {
        return NextResponse.json(
          { error: "Property ID is required" },
          { status: 400 }
        );
      }

      // Get property data
      const property = await prisma.property.findFirst({
        where: { id: propertyId, storeId },
      });

      if (!property) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      // Get comparable listings from database
      const comparables = await prisma.property.findMany({
        where: {
          storeId,
          status: "sold",
          id: { not: propertyId },
          // Filter by similar properties (same type, similar size)
          propertyType: property.propertyType,
        },
        take: 10,
      });

      // Calculate CMA using comparative market analysis
      const subjectProperty = {
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        squareFeet: property.squareFeet || 0,
        lotSize: property.lotSize || 0,
        yearBuilt: property.yearBuilt || 0,
        propertyType: property.propertyType,
      };

      // Calculate adjusted values for each comparable
      const adjustedComps = comparables.map(comp => {
        const basePrice = comp.salePrice || 0;
        
        // Adjust for differences
        let adjustedPrice = basePrice;
        
        // Bedroom adjustment (+/- $10k per bedroom difference)
        if (comp.bedrooms !== subjectProperty.bedrooms) {
          adjustedPrice += (subjectProperty.bedrooms - comp.bedrooms) * 10000;
        }
        
        // Bathroom adjustment (+/- $8k per bathroom difference)
        if (comp.bathrooms !== subjectProperty.bathrooms) {
          adjustedPrice += (subjectProperty.bathrooms - comp.bathrooms) * 8000;
        }
        
        // Square footage adjustment (+/- $200 per sqft difference)
        if (comp.squareFeet !== subjectProperty.squareFeet) {
          adjustedPrice += (subjectProperty.squareFeet - comp.squareFeet) * 200;
        }
        
        // Age adjustment (+/- $5k per year difference, max 50 years)
        if (comp.yearBuilt !== subjectProperty.yearBuilt) {
          const ageDiff = Math.min(50, Math.abs(subjectProperty.yearBuilt - comp.yearBuilt));
          adjustedPrice += (subjectProperty.yearBuilt > comp.yearBuilt ? 1 : -1) * ageDiff * 5000;
        }
        
        return {
          comparableId: comp.id,
          address: comp.address,
          salePrice: basePrice,
          adjustedPrice,
          similarityScore: calculateSimilarityScore(subjectProperty, comp),
          daysOnMarket: comp.daysOnMarket || 0,
          saleDate: comp.soldDate,
        };
      });

      // Calculate estimated value (weighted average of adjusted comps)
      const totalWeight = adjustedComps.reduce((sum, comp) => sum + comp.similarityScore, 0);
      const estimatedValue = adjustedComps.reduce((sum, comp) => {
        const weight = comp.similarityScore / totalWeight;
        return sum + (comp.adjustedPrice * weight);
      }, 0);

      // Calculate value range (±5% typically)
      const valueRangeLow = estimatedValue * 0.95;
      const valueRangeHigh = estimatedValue * 1.05;
      
      // Recommended listing price (slightly below estimated value for faster sale)
      const valueRecommended = estimatedValue * 0.98;
      
      // Price per square foot
      const pricePerSqft = subjectProperty.squareFeet > 0 
        ? estimatedValue / subjectProperty.squareFeet 
        : 0;
      
      // Confidence score based on number and quality of comparables
      const confidenceScore = Math.min(100, (adjustedComps.length / 10) * 100);
      
      // Estimated days on market (based on avg DOM of comparables)
      const avgDaysOnMarket = adjustedComps.reduce((sum, comp) => sum + comp.daysOnMarket, 0) / adjustedComps.length || 30;

      // Create CMA report in database with calculated values
      const cmaReport = await prisma.cMAReport.create({
        data: {
          merchantId: storeId,
          agentId: user.id,
          propertyId,
          estimatedValue: Math.round(estimatedValue),
          valueRangeLow: Math.round(valueRangeLow),
          valueRangeHigh: Math.round(valueRangeHigh),
          valueRecommended: Math.round(valueRecommended),
          pricePerSqft: Math.round(pricePerSqft),
          confidenceScore: Math.round(confidenceScore),
          daysOnMarketEstimate: Math.round(avgDaysOnMarket),
          notes,
          comparables: {
            create: adjustedComps.map(comp => ({
              propertyId: comp.comparableId,
              adjustedValue: Math.round(comp.adjustedPrice),
              similarityScore: comp.similarityScore,
            })),
          },
        },
        include: {
          comparables: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: cmaReport,
      });
    } catch (error: unknown) {
      logger.error("[CMA_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// GET List CMA Reports
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const propertyId = searchParams.get("propertyId");

      const reports = await prisma.cMAReport.findMany({
        where: {
          merchantId: storeId,
          ...(propertyId ? { propertyId } : {}),
        },
        include: {
          property: true,
          comparables: true,
        },
        orderBy: { generatedAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.cMAReport.count({
        where: {
          merchantId: storeId,
          ...(propertyId ? { propertyId } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        data: reports,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[CMA_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);
