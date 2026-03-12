import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/dashboard/aggregate - Get Real Estate aggregated metrics
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      // Get date range from query params (default: last 30 days)
      const { searchParams } = new URL(req.url);
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      
      const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : new Date();

      // Fetch all metrics in parallel
      const [
        revenueData,
        listingsData,
        leadsData,
        showingsData,
        conversionData
      ] = await Promise.all([
        // Revenue (commission from sales/rentals)
        prisma.$queryRaw`
          SELECT 
            COALESCE(SUM(p.price * 0.03), 0) as total_revenue,
            COUNT(DISTINCT p.id) as total_transactions
          FROM Property p
          WHERE p.store_id = ${storeId}
            AND p.status IN ('sold', 'rented')
            AND p."updatedAt" BETWEEN ${fromDate} AND ${toDate}
        `,
        
        // Active Listings
        prisma.property.count({
          where: {
            storeId,
            status: 'available'
          }
        }),
        
        // Leads
        prisma.realEstateLead.groupBy({
          by: ['status'],
          where: {
            merchantId: storeId,
            createdAt: {
              gte: fromDate,
              lte: toDate
            }
          },
          _count: true
        }),
        
        // Showings
        prisma.propertyShowing.count({
          where: {
            merchantId: storeId,
            scheduledAt: {
              gte: fromDate,
              lte: toDate
            }
          }
        }),
        
        // Conversion rate calculation
        Promise.all([
          prisma.realEstateLead.count({
            where: {
              merchantId: storeId,
              status: 'converted',
              updatedAt: {
                gte: fromDate,
                lte: toDate
              }
            }
          }),
          prisma.realEstateLead.count({
            where: {
              merchantId: storeId,
              createdAt: {
                gte: fromDate,
                lte: toDate
              }
            }
          })
        ])
      ]);

      // Process revenue data
      const revenue = Number((revenueData as any)[0]?.total_revenue || 0);
      const transactions = Number((revenueData as any)[0]?.total_transactions || 0);

      // Process leads by status
      const leadsByStatus: Record<string, number> = {};
      let totalLeads = 0;
      (leadsData as Array<{ status: string; _count: number }>).forEach(item => {
        leadsByStatus[item.status] = item._count;
        totalLeads += item._count;
      });

      // Calculate conversion rate
      const convertedLeads = conversionData[0];
      const totalLeadsAll = conversionData[1];
      const conversionRate = totalLeadsAll > 0 ? (convertedLeads / totalLeadsAll) * 100 : 0;

      // Get previous period data for comparison
      const previousFrom = new Date(fromDate.getTime() - (toDate.getTime() - fromDate.getTime()));
      const previousTo = fromDate;

      const [previousRevenue, previousListings, previousLeads, previousShowings] = await Promise.all([
        prisma.$queryRaw`
          SELECT COALESCE(SUM(p.price * 0.03), 0) as total_revenue
          FROM Property p
          WHERE p.store_id = ${storeId}
            AND p.status IN ('sold', 'rented')
            AND p."updatedAt" BETWEEN ${previousFrom} AND ${previousTo}
        `,
        prisma.property.count({
          where: {
            storeId,
            status: 'available'
          }
        }),
        prisma.realEstateLead.count({
          where: {
            merchantId: storeId,
            createdAt: {
              gte: previousFrom,
              lte: previousTo
            }
          }
        }),
        prisma.propertyShowing.count({
          where: {
            merchantId: storeId,
            scheduledAt: {
              gte: previousFrom,
              lte: previousTo
            }
          }
        })
      ]);

      const previousRevenueValue = Number((previousRevenue as any)[0]?.total_revenue || 0);
      const revenueGrowth = previousRevenueValue > 0 
        ? ((revenue - previousRevenueValue) / previousRevenueValue) * 100 
        : 0;

      const listingsGrowth = previousListings > 0 
        ? ((listingsData - previousListings) / previousListings) * 100 
        : 0;

      const leadsGrowth = previousLeads > 0 
        ? ((totalLeads - previousLeads) / previousLeads) * 100 
        : 0;

      const showingsGrowth = previousShowings > 0 
        ? ((showingsData - previousShowings) / previousShowings) * 100 
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          revenue: {
            value: revenue,
            growth: revenueGrowth,
            transactions
          },
          listings: {
            value: listingsData,
            growth: listingsGrowth
          },
          leads: {
            value: totalLeads,
            growth: leadsGrowth,
            byStatus: leadsByStatus
          },
          showings: {
            value: showingsData,
            growth: showingsGrowth
          },
          conversion: {
            value: conversionRate,
            growth: 0 // Would need more complex calculation
          },
          period: {
            from: fromDate.toISOString(),
            to: toDate.toISOString()
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[REALESTATE_DASHBOARD_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch real estate dashboard data" },
        { status: 500 }
      );
    }
  }
);
