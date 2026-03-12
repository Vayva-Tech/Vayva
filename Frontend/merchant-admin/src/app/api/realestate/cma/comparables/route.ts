import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/cma/comparables - Get comparable properties for CMA
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const propertyId = searchParams.get("propertyId");
      const radius = parseInt(searchParams.get("radius") || "2");
      const months = parseInt(searchParams.get("months") || "6");

      if (!propertyId) {
        return NextResponse.json(
          { success: false, error: "Property ID is required" },
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

      // Find comparable properties
      const monthsAgo = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
      
      const comparables = await prisma.property.findMany({
        where: {
          storeId,
          status: { in: ['sold', 'rented'] },
          type: subjectProperty.type,
          purpose: subjectProperty.purpose,
          updatedAt: { gte: monthsAgo },
          id: { not: propertyId }
        },
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          state: true,
          price: true,
          bedrooms: true,
          bathrooms: true,
          area: true,
          yearBuilt: true,
          type: true,
          purpose: true,
          status: true,
          images: true,
          amenities: true,
          soldAt: true,
          updatedAt: true,
          lat: true,
          lng: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 50
      });

      // Score and rank comparables
      const scoredComparables = comparables.map(comp => {
        let similarityScore = 100;
        let adjustments = 0;

        // Bedroom difference
        const bedDiff = Math.abs((comp.bedrooms || 3) - (subjectProperty.bedrooms || 3));
        similarityScore -= bedDiff * 10;
        adjustments += bedDiff * 15000; // $15k per bedroom difference

        // Bathroom difference
        const bathDiff = Math.abs((comp.bathrooms || 2) - (subjectProperty.bathrooms || 2));
        similarityScore -= bathDiff * 8;
        adjustments += bathDiff * 10000; // $10k per bathroom difference

        // Area difference
        const areaDiffPercent = Math.abs(((comp.area || 2000) - (subjectProperty.area || 2000)) / (subjectProperty.area || 2000) * 100);
        similarityScore -= Math.min(areaDiffPercent, 30);
        adjustments += ((comp.area || 2000) - (subjectProperty.area || 2000)) * 150; // $150/sqft

        // Year built difference
        const yearDiff = Math.abs((comp.yearBuilt || 2000) - (subjectProperty.yearBuilt || 2000));
        similarityScore -= Math.min(yearDiff / 2, 20);

        // Adjust for garage
        const compGarage = comp.amenities?.includes('garage') ? 1 : 0;
        const subjectGarage = subjectProperty.amenities?.includes('garage') ? 1 : 0;
        adjustments += (compGarage - subjectGarage) * 8000;

        // Adjust for pool
        const compPool = comp.amenities?.includes('pool') ? 1 : 0;
        const subjectPool = subjectProperty.amenities?.includes('pool') ? 1 : 0;
        adjustments += (compPool - subjectPool) * 25000;

        // Calculate adjusted value
        const adjustedValue = Number(comp.price) + adjustments;

        return {
          ...comp,
          similarityScore: Math.max(0, Math.round(similarityScore)),
          adjustments,
          adjustedValue
        };
      });

      // Sort by similarity score
      const sortedComparables = scoredComparables
        .sort((a, b) => b.similarityScore - a.similarityScore);

      // Calculate statistics
      const avgPrice = sortedComparables.reduce((sum, comp) => sum + Number(comp.price), 0) / sortedComparables.length;
      const avgAdjustedPrice = sortedComparables.reduce((sum, comp) => sum + comp.adjustedValue, 0) / sortedComparables.length;
      const avgPricePerSqft = sortedComparables.reduce((sum, comp) => sum + (Number(comp.price) / (comp.area || 2000)), 0) / sortedComparables.length;

      return NextResponse.json({
        success: true,
        data: {
          subjectProperty: {
            id: subjectProperty.id,
            title: subjectProperty.title,
            address: subjectProperty.address,
            bedrooms: subjectProperty.bedrooms,
            bathrooms: subjectProperty.bathrooms,
            area: subjectProperty.area,
            price: Number(subjectProperty.price)
          },
          comparables: sortedComparables.slice(0, 20), // Return top 20
          statistics: {
            totalComparables: sortedComparables.length,
            averagePrice: avgPrice,
            averageAdjustedPrice: avgAdjustedPrice,
            averagePricePerSqft: avgPricePerSqft,
            priceRange: {
              min: Math.min(...sortedComparables.map(c => Number(c.price))),
              max: Math.max(...sortedComparables.map(c => Number(c.price)))
            }
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[CMA_COMPARABLES_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch comparables" },
        { status: 500 }
      );
    }
  }
);
