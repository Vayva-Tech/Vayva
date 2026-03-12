import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

interface CMAConfig {
  searchRadius: number; // miles
  timeRange: number; // months
  minComps: number;
  maxComps: number;
  adjustments: {
    bedroom: number;
    bathroom: number;
    sqft: number;
    garage: number;
    pool: number;
  };
}

// POST /api/realestate/cma/generate - Generate a new CMA report
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        propertyId,
        agentId,
        config
      }: {
        propertyId: string;
        agentId: string;
        config?: Partial<CMAConfig>;
      } = body;

      if (!propertyId || !agentId) {
        return NextResponse.json(
          { success: false, error: "Property ID and Agent ID are required" },
          { status: 400 }
        );
      }

      // Get subject property
      const subjectProperty = await prisma.property.findUnique({
        where: { id: propertyId, storeId }
      });

      if (!subjectProperty) {
        return NextResponse.json(
          { success: false, error: "Property not found" },
          { status: 404 }
        );
      }

      // Default CMA configuration
      const defaultConfig: CMAConfig = {
        searchRadius: 2, // miles
        timeRange: 6, // months
        minComps: 3,
        maxComps: 10,
        adjustments: {
          bedroom: 15000,
          bathroom: 10000,
          sqft: 150,
          garage: 8000,
          pool: 25000
        }
      };

      const finalConfig = { ...defaultConfig, ...config };

      // Find comparable properties
      const sixMonthsAgo = new Date(Date.now() - finalConfig.timeRange * 30 * 24 * 60 * 60 * 1000);
      
      const comparables = await prisma.property.findMany({
        where: {
          storeId,
          status: { in: ['sold', 'rented'] },
          type: subjectProperty.type,
          purpose: subjectProperty.purpose,
          updatedAt: { gte: sixMonthsAgo },
          id: { not: propertyId },
          // Basic filters
          bedrooms: {
            lte: (subjectProperty.bedrooms || 3) + 2,
            gte: (subjectProperty.bedrooms || 3) - 2
          },
          bathrooms: {
            lte: (subjectProperty.bathrooms || 2) + 2,
            gte: (subjectProperty.bathrooms || 2) - 1
          },
          area: {
            lte: ((subjectProperty.area || 2000) * 1.5),
            gte: ((subjectProperty.area || 2000) * 0.7)
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: finalConfig.maxComps * 2 // Get more initially for scoring
      });

      // Score comparables by similarity
      const scoredComparables = comparables.map(comp => {
        let similarityScore = 100;

        // Bedroom difference
        const bedDiff = Math.abs((comp.bedrooms || 3) - (subjectProperty.bedrooms || 3));
        similarityScore -= bedDiff * 10;

        // Bathroom difference
        const bathDiff = Math.abs((comp.bathrooms || 2) - (subjectProperty.bathrooms || 2));
        similarityScore -= bathDiff * 8;

        // Area difference (percentage)
        const areaDiff = Math.abs(((comp.area || 2000) - (subjectProperty.area || 2000)) / (subjectProperty.area || 2000) * 100);
        similarityScore -= Math.min(areaDiff, 30);

        // Year built difference
        const yearDiff = Math.abs((comp.yearBuilt || 2000) - (subjectProperty.yearBuilt || 2000));
        similarityScore -= Math.min(yearDiff / 2, 20);

        // Distance calculation (simplified - would use lat/lng in production)
        // In production, use Haversine formula or PostGIS
        const distanceScore = 20; // Assume all are within radius for now
        similarityScore -= distanceScore;

        return {
          ...comp,
          similarityScore: Math.max(0, Math.round(similarityScore))
        };
      });

      // Sort by similarity and take top comps
      const topComparables = scoredComparables
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, finalConfig.maxComps);

      if (topComparables.length < finalConfig.minComps) {
        logger.warn("[CMA_GENERATE] Not enough comparables found", {
          propertyId,
          found: topComparables.length,
          required: finalConfig.minComps
        });
      }

      // Calculate adjusted values
      const adjustedValues = topComparables.map(comp => {
        let adjustedValue = Number(comp.price);

        // Adjust for bedrooms
        const bedDiff = (comp.bedrooms || 3) - (subjectProperty.bedrooms || 3);
        adjustedValue += bedDiff * finalConfig.adjustments.bedroom;

        // Adjust for bathrooms
        const bathDiff = (comp.bathrooms || 2) - (subjectProperty.bathrooms || 2);
        adjustedValue += bathDiff * finalConfig.adjustments.bathroom;

        // Adjust for area
        const areaDiff = (comp.area || 2000) - (subjectProperty.area || 2000);
        adjustedValue += areaDiff * finalConfig.adjustments.sqft;

        // Adjust for garage (simplified - assume 1 car if has garage)
        const compGarage = comp.amenities.includes('garage') ? 1 : 0;
        const subjectGarage = subjectProperty.amenities.includes('garage') ? 1 : 0;
        adjustedValue += (compGarage - subjectGarage) * finalConfig.adjustments.garage;

        // Adjust for pool
        const compPool = comp.amenities.includes('pool') ? 1 : 0;
        const subjectPool = subjectProperty.amenities.includes('pool') ? 1 : 0;
        adjustedValue += (compPool - subjectPool) * finalConfig.adjustments.pool;

        return {
          originalValue: Number(comp.price),
          adjustedValue,
          property: comp
        };
      });

      // Calculate estimated value
      const avgAdjustedValue = adjustedValues.reduce((sum, comp) => sum + comp.adjustedValue, 0) / adjustedValues.length;
      const pricePerSqft = subjectProperty.area ? avgAdjustedValue / subjectProperty.area : 0;

      // Calculate confidence score based on number of comps and their similarity
      const avgSimilarity = topComparables.reduce((sum, comp) => sum + comp.similarityScore, 0) / topComparables.length;
      const confidenceScore = Math.min(100, Math.round((topComparables.length / finalConfig.maxComps) * 50 + avgSimilarity * 0.5));

      // Determine market conditions
      const daysOnMarketAvg = 45; // Would calculate from actual sold data
      const marketConditions = daysOnMarketAvg < 30 ? 'hot' : daysOnMarketAvg > 60 ? 'cold' : 'stable';

      // Create CMA report
      const cmaReport = await prisma.cMAReport.create({
        data: {
          merchantId: storeId,
          agentId,
          propertyId,
          estimatedValue: avgAdjustedValue,
          valueRangeLow: avgAdjustedValue * 0.95,
          valueRangeHigh: avgAdjustedValue * 1.05,
          valueRecommended: avgAdjustedValue,
          pricePerSqft,
          confidenceScore,
          daysOnMarketEstimate: daysOnMarketAvg,
          comparablesCount: topComparables.length,
          marketConditions,
          notes: `Generated using ${topComparables.length} comparable properties`,
          config: finalConfig as any
        }
      });

      // Create comparable property relationships
      await Promise.all(
        topComparables.map(comp =>
          prisma.comparableProperty.create({
            data: {
              cmaReportId: cmaReport.id,
              propertyId: comp.id,
              similarityScore: comp.similarityScore
            }
          })
        )
      );

      // Fetch full report with comparables
      const fullReport = await prisma.cMAReport.findUnique({
        where: { id: cmaReport.id },
        include: {
          comparables: {
            include: {
              comparableProperty: true
            }
          },
          property: true
        }
      });

      return NextResponse.json({
        success: true,
        data: fullReport
      });
    } catch (error: unknown) {
      logger.error("[CMA_GENERATE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to generate CMA report" },
        { status: 500 }
      );
    }
  }
);
