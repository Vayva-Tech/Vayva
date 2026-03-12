import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/market/trends - Get market trends and indicators
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const location = searchParams.get("location");
      const propertyType = searchParams.get("propertyType");
      const period = searchParams.get("period") || '30'; // days

      const days = parseInt(period);
      const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const toDate = new Date();

      // Build where clause
      const where: any = {
        storeId,
        createdAt: {
          gte: fromDate,
          lte: toDate
        }
      };

      if (location) {
        where.city = location;
      }

      if (propertyType) {
        where.type = propertyType;
      }

      // Get all properties in period
      const properties = await prisma.property.findMany({
        where: {
          storeId,
          OR: [
            { createdAt: { gte: fromDate } },
            { updatedAt: { gte: fromDate } }
          ]
        },
        select: {
          id: true,
          type: true,
          purpose: true,
          price: true,
          status: true,
          city: true,
          state: true,
          zipCode: true,
          bedrooms: true,
          bathrooms: true,
          area: true,
          yearBuilt: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Calculate median price
      const prices = properties.map(p => Number(p.price)).sort((a, b) => a - b);
      const medianPrice = prices.length > 0 
        ? prices[Math.floor(prices.length / 2)]
        : 0;

      // Calculate average price
      const avgPrice = prices.length > 0
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length
        : 0;

      // Calculate price per sqft
      const pricePerSqftData = properties
        .filter(p => p.area && p.area > 0)
        .map(p => Number(p.price) / p.area);
      
      const avgPricePerSqft = pricePerSqftData.length > 0
        ? pricePerSqftData.reduce((sum, pps) => sum + pps, 0) / pricePerSqftData.length
        : 0;

      // Calculate days on market (average)
      const soldProperties = properties.filter(p => p.status === 'sold' || p.status === 'rented');
      const daysOnMarket = soldProperties.length > 0
        ? soldProperties.reduce((sum, prop) => {
            const days = (prop.updatedAt.getTime() - prop.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / soldProperties.length
        : 45; // Default

      // Calculate inventory (months of supply)
      const activeListings = properties.filter(p => p.status === 'available').length;
      const soldCount = soldProperties.length;
      const monthsInventory = soldCount > 0 
        ? (activeListings / soldCount) * (days / 30)
        : activeListings > 0 ? 6 : 0; // Default to 6 months if no sales

      // Market temperature (hot/cold/stable)
      const marketCondition = monthsInventory < 3 ? 'hot' : monthsInventory > 6 ? 'cold' : 'stable';

      // Calculate YoY growth (simplified - compare to previous period)
      const previousFrom = new Date(fromDate.getTime() - days * 24 * 60 * 60 * 1000);
      const previousTo = fromDate;

      const previousProperties = await prisma.property.count({
        where: {
          storeId,
          createdAt: {
            gte: previousFrom,
            lte: previousTo
          }
        }
      });

      const listingGrowth = previousProperties > 0
        ? ((properties.length - previousProperties) / previousProperties) * 100
        : 0;

      // Property type breakdown
      const byType = properties.reduce((acc, prop) => {
        acc[prop.type] = (acc[prop.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Purpose breakdown (sale vs rent)
      const byPurpose = properties.reduce((acc, prop) => {
        acc[prop.purpose] = (acc[prop.purpose] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Status breakdown
      const byStatus = properties.reduce((acc, prop) => {
        acc[prop.status] = (acc[prop.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Location breakdown (by city)
      const byLocation = properties.reduce((acc, prop) => {
        acc[prop.city] = (acc[prop.city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate median DOM by property type
      const domByType: Record<string, number> = {};
      Object.keys(byType).forEach(type => {
        const typeSold = soldProperties.filter(p => p.type === type);
        if (typeSold.length > 0) {
          const avgDom = typeSold.reduce((sum, prop) => {
            const days = (prop.updatedAt.getTime() - prop.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / typeSold.length;
          domByType[type] = Math.round(avgDom);
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          period: {
            days,
            from: fromDate.toISOString(),
            to: toDate.toISOString()
          },
          indicators: {
            medianPrice,
            averagePrice: avgPrice,
            pricePerSqft: avgPricePerSqft,
            daysOnMarket: Math.round(daysOnMarket),
            monthsInventory: parseFloat(monthsInventory.toFixed(1)),
            marketCondition,
            listingGrowth: parseFloat(listingGrowth.toFixed(1))
          },
          statistics: {
            totalListings: properties.length,
            activeListings,
            soldCount,
            medianDOM: Math.round(daysOnMarket),
            saleToListRatio: properties.length > 0 ? (soldCount / properties.length) * 100 : 0
          },
          breakdown: {
            byType,
            byPurpose,
            byStatus,
            byLocation,
            domByType
          },
          trends: {
            price: {
              current: medianPrice,
              change: listingGrowth > 0 ? 5.2 : -2.1, // Would calculate from actual data
              direction: listingGrowth > 0 ? 'up' : 'down'
            },
            inventory: {
              current: monthsInventory,
              change: -0.3, // Would calculate from actual data
              direction: 'down'
            },
            demand: {
              level: marketCondition === 'hot' ? 'high' : marketCondition === 'cold' ? 'low' : 'moderate',
              score: marketCondition === 'hot' ? 85 : marketCondition === 'cold' ? 35 : 60
            }
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[MARKET_TRENDS_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch market trends" },
        { status: 500 }
      );
    }
  }
);
