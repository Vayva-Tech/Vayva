import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.DONORS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let donorIdForLog = "";
    try {
      const { id } = await params;
      donorIdForLog = id;

      const donor = await prisma.nonprofitDonor.findFirst({
        where: { id, storeId },
      });

      if (!donor) {
        return NextResponse.json(
          { error: "Donor not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const donationHistory = await prisma.nonprofitDonation.findMany({
        where: {
          donorId: id,
          storeId,
        },
        include: {
          campaign: {
            select: {
              name: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      const recurringHistory = await prisma.nonprofitRecurringDonation.findMany({
        where: {
          donorId: id,
          storeId,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const twelveMonthsAgo = new Date(
        Date.now() - 12 * 30 * 24 * 60 * 60 * 1000,
      );
      const recentDonations = donationHistory.filter(
        (d) => d.createdAt >= twelveMonthsAgo,
      );

      const monthlyTotals: Record<string, { count: number; amount: number }> = {};
      recentDonations.forEach((donation) => {
        const monthKey = donation.createdAt.toISOString().slice(0, 7);
        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = { count: 0, amount: 0 };
        }
        monthlyTotals[monthKey].count += 1;
        monthlyTotals[monthKey].amount += donation.amount;
      });

      const timelineData = Object.entries(monthlyTotals)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, stats]) => ({
          month,
          donationCount: stats.count,
          totalAmount: Math.round(stats.amount * 100) / 100,
          averageAmount: Math.round((stats.amount / stats.count) * 100) / 100,
        }));

      const totalDonations = donationHistory.length;
      const totalAmount = donationHistory.reduce((sum, d) => sum + d.amount, 0);
      const recentActivity = recentDonations.length;

      const engagementScore = Math.min(
        100,
        Math.log(totalDonations + 1) * 10 +
          Math.log(totalAmount / 100 + 1) * 5 +
          recentActivity * 2,
      );

      return NextResponse.json(
        {
          data: {
            donorId: id,
            donorName:
              `${donor.firstName} ${donor.lastName}`.trim() || donor.organization,
            donationHistory,
            recurringHistory,
            timelineData,
            engagement: {
              totalDonations,
              totalAmount: Math.round(totalAmount * 100) / 100,
              recentDonations: recentDonations.length,
              engagementScore: Math.round(engagementScore),
              status:
                engagementScore > 70
                  ? "highly engaged"
                  : engagementScore > 40
                    ? "moderately engaged"
                    : "low engagement",
            },
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_DONOR_HISTORY_GET]", {
        error,
        donorId: donorIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch donor history" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
