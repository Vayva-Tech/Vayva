import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.CAMPAIGNS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let campaignIdForLog = "";
    try {
      const { id } = await params;
      campaignIdForLog = id;

      const campaign = await prisma.nonprofitCampaign.findFirst({
        where: { id, storeId },
      });

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const donationStats = await prisma.nonprofitDonation.aggregate({
        where: {
          campaignId: id,
          storeId,
          status: "completed",
        },
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
      });

      const totalRaised = donationStats._sum.amount || 0;
      const donationCount = donationStats._count.id;
      const averageDonation = donationStats._avg.amount || 0;
      const progressPercentage =
        campaign.goal > 0 ? (totalRaised / campaign.goal) * 100 : 0;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const dailyDonations = await prisma.nonprofitDonation.findMany({
        where: {
          campaignId: id,
          storeId,
          status: "completed",
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          amount: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });

      const dailyProgress: Record<string, number> = {};
      dailyDonations.forEach((donation) => {
        const dateKey = donation.createdAt.toISOString().split("T")[0];
        dailyProgress[dateKey] = (dailyProgress[dateKey] || 0) + donation.amount;
      });

      const progressData = Object.entries(dailyProgress)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount], index, arr) => {
          const cumulativeAmount = arr
            .slice(0, index + 1)
            .reduce((sum, [, amt]) => sum + amt, 0);
          return {
            date,
            amount,
            cumulativeAmount,
          };
        });

      const topDonors = await prisma.nonprofitDonation.groupBy({
        by: ["donorId"],
        where: {
          campaignId: id,
          storeId,
          status: "completed",
        },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 10,
      });

      const topDonorDetails = await Promise.all(
        topDonors.map(async (donorStat) => {
          const donorRow = await prisma.nonprofitDonor.findFirst({
            where: { id: donorStat.donorId, storeId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              organization: true,
              anonymous: true,
            },
          });

          return {
            ...donorRow,
            totalAmount: donorStat._sum.amount,
            donationCount: donorStat._count.id,
          };
        }),
      );

      return NextResponse.json(
        {
          data: {
            campaignId: id,
            campaignName: campaign.name,
            goal: campaign.goal,
            totalRaised,
            progressPercentage: Math.round(progressPercentage * 100) / 100,
            donationCount,
            averageDonation: Math.round(averageDonation * 100) / 100,
            daysRemaining: Math.max(
              0,
              Math.ceil(
                (campaign.endDate.getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              ),
            ),
            currency: campaign.currency,
            progressData,
            topDonors: topDonorDetails,
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_CAMPAIGN_PROGRESS_GET]", {
        error,
        campaignId: campaignIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch campaign progress" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
