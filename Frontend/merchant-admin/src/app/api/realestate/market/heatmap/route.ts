import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/market/heatmap - Get neighborhood heatmap data
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const metric = searchParams.get("metric") || 'price'; // price, dom, appreciation, activity
      const granularity = searchParams.get("granularity") || 'neighborhood'; // neighborhood, zip, city

      // Get all properties with location data
      const properties = await prisma.property.findMany({
        where: {
          storeId,
          status: { in: ['available', 'sold', 'pending'] }
        },
        select: {
          id: true,
          city: true,
          state: true,
          zipCode: true,
          price: true,
          status: true,
          area: true,
          bedrooms: true,
          bathrooms: true,
          createdAt: true,
          updatedAt: true,
          lat: true,
          lng: true
        }
      });

      // Group by location (zip code or city)
      const groupedByLocation = properties.reduce((acc, prop) => {
        const key = granularity === 'zip' && prop.zipCode ? prop.zipCode : prop.city;
        
        if (!acc[key]) {
          acc[key] = {
            location: key,
            properties: [],
            count: 0
          };
        }
        
        acc[key].properties.push(prop);
        acc[key].count++;
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate metrics for each location
      const heatmapData = Object.values(groupedByLocation).map((area: any) => {
        const props = area.properties;
        const prices = props.map(p => Number(p.price)).sort((a, b) => a - b);
        
        // Median price
        const medianPrice = prices.length > 0 
          ? prices[Math.floor(prices.length / 2)]
          : 0;

        // Average price per sqft
        const pricePerSqft = props
          .filter(p => p.area && p.area > 0)
          .map(p => Number(p.price) / p.area);
        const avgPricePerSqft = pricePerSqft.length > 0
          ? pricePerSqft.reduce((sum, pps) => sum + pps, 0) / pricePerSqft.length
          : 0;

        // Days on market (average for sold properties)
        const soldProps = props.filter(p => p.status === 'sold');
        const avgDOM = soldProps.length > 0
          ? soldProps.reduce((sum, prop) => {
              const days = (prop.updatedAt.getTime() - prop.createdAt.getTime()) / (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / soldProps.length
          : 30;

        // Activity level (new listings in last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const activeListings = props.filter(p => 
          p.status === 'available' && p.createdAt >= thirtyDaysAgo
        ).length;

        // Appreciation rate (simplified - would need historical data)
        const appreciationRate = 5.2; // Placeholder

        // Determine heat level (0-100) based on selected metric
        let heatValue = 50;
        let heatLevel = 'warm';

        switch (metric) {
          case 'price':
            heatValue = medianPrice / 10000; // Scale down
            break;
          case 'dom':
            heatValue = 100 - Math.min(avgDOM, 100); // Lower DOM = hotter
            break;
          case 'appreciation':
            heatValue = appreciationRate * 10;
            break;
          case 'activity':
            heatValue = (activeListings / props.length) * 100;
            break;
          default:
            heatValue = medianPrice / 10000;
        }

        // Normalize to 0-100 scale
        heatValue = Math.max(0, Math.min(100, heatValue));

        // Determine heat level category
        if (heatValue >= 75) heatLevel = 'hot';
        else if (heatValue >= 50) heatLevel = 'warm';
        else if (heatValue >= 25) heatLevel = 'neutral';
        else heatLevel = 'cool';

        return {
          location: area.location,
          type: granularity,
          metrics: {
            medianPrice,
            pricePerSqft: avgPricePerSqft,
            daysOnMarket: Math.round(avgDOM),
            activeListings,
            totalListings: props.length,
            appreciationRate,
            heatValue: Math.round(heatValue),
            heatLevel
          },
          coordinates: {
            lat: props[0]?.lat || null,
            lng: props[0]?.lng || null
          },
          stats: {
            avgBedrooms: props.reduce((sum, p) => sum + (p.bedrooms || 0), 0) / props.length,
            avgBathrooms: props.reduce((sum, p) => sum + (p.bathrooms || 0), 0) / props.length,
            avgArea: props.reduce((sum, p) => sum + (p.area || 0), 0) / props.length
          }
        };
      });

      // Sort by heat value
      heatmapData.sort((a, b) => b.metrics.heatValue - a.metrics.heatValue);

      // Calculate overall statistics
      const overallStats = {
        totalLocations: heatmapData.length,
        hotLocations: heatmapData.filter(d => d.metrics.heatLevel === 'hot').length,
        warmLocations: heatmapData.filter(d => d.metrics.heatLevel === 'warm').length,
        neutralLocations: heatmapData.filter(d => d.metrics.heatLevel === 'neutral').length,
        coolLocations: heatmapData.filter(d => d.metrics.heatLevel === 'cool').length,
        avgHeatValue: heatmapData.reduce((sum, d) => sum + d.metrics.heatValue, 0) / heatmapData.length
      };

      return NextResponse.json({
        success: true,
        data: {
          metric,
          granularity,
          heatmapData,
          overallStats,
          legend: {
            hot: { range: '75-100', description: 'High demand, fast sales' },
            warm: { range: '50-74', description: 'Balanced market' },
            neutral: { range: '25-49', description: 'Moderate activity' },
            cool: { range: '0-24', description: 'Low demand, slow sales' }
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[MARKET_HEATMAP_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch market heatmap" },
        { status: 500 }
      );
    }
  }
);
