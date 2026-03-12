import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.DONATIONS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Get donation summary statistics
      const [totalDonations, totalAmount, donorCount, campaignCount] = await Promise.all([
        prisma.nonprofitDonation.count({ where: { storeId } }),
        prisma.nonprofitDonation.aggregate({
          where: { storeId },
          _sum: { amount: true },
        }),
        prisma.nonprofitDonor.count({ where: { storeId } }),
        prisma.nonprofitCampaign.count({ where: { storeId } }),
      ]);

      // Get recent donations for trend analysis
      const recentDonations = await prisma.nonprofitDonation.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      // Calculate trends
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const thisMonthDonations = recentDonations.filter(d => d.createdAt >= thirtyDaysAgo);
      const thisMonthAmount = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0);

      // Top donors
      const donorAggregates = await prisma.nonprofitDonation.groupBy({
        by: ['donorId'],
        where: { storeId },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
      });

      const topDonors = await Promise.all(
        donorAggregates.map(async (agg) => {
          const donor = await prisma.nonprofitDonor.findUnique({
            where: { id: agg.donorId },
            select: { id: true, firstName: true, lastName: true, organization: true },
          });
          return {
            ...donor,
            totalAmount: agg._sum.amount,
            donationCount: agg._count.id,
          };
        })
      );

      return NextResponse.json(
        {
          data: {
            summary: {
              totalDonations,
              totalAmount: totalAmount._sum.amount || 0,
              donorCount,
              campaignCount,
              currency: "USD",
            },
            trends: {
              thisMonthDonations: thisMonthDonations.length,
              thisMonthAmount,
              averageDonation: totalDonations > 0 ? (totalAmount._sum.amount || 0) / totalDonations : 0,
            },
            topDonors,
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_DONATIONS_SUMMARY_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch donation summary" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);