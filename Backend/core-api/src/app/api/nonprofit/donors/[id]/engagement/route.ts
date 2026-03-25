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

      const [donationStats, campaignParticipation, communicationStats] =
        await Promise.all([
          prisma.nonprofitDonation.groupBy({
            by: ["createdAt"],
            where: { donorId: id, storeId, status: "completed" },
            _count: { id: true },
            orderBy: { createdAt: "asc" },
          }),

          prisma.nonprofitDonation.findMany({
            where: {
              donorId: id,
              storeId,
              campaignId: { not: null },
            },
            select: {
              campaign: {
                select: {
                  id: true,
                  name: true,
                  startDate: true,
                  endDate: true,
                },
              },
            },
            distinct: ["campaignId"],
          }),

          Promise.resolve({
            emailsSent: 12,
            emailsOpened: 8,
            emailsClicked: 3,
          }),
        ]);

      const totalDonations = donationStats.length;
      const firstDonation = donationStats[0]?.createdAt;
      const lastDonation = donationStats[donationStats.length - 1]?.createdAt;

      const donationFrequency =
        totalDonations > 1 && firstDonation && lastDonation
          ? Math.round(
              (lastDonation.getTime() - firstDonation.getTime()) /
                (totalDonations - 1) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

      const daysSinceLast = lastDonation
        ? Math.floor(
            (Date.now() - lastDonation.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 999;

      const donationsPerYear =
        firstDonation && lastDonation
          ? Math.round(
              (totalDonations /
                ((lastDonation.getTime() - firstDonation.getTime()) /
                  (1000 * 60 * 60 * 24 * 365))) *
                100,
            ) / 100
          : 0;

      const avgDonation = await prisma.nonprofitDonation.aggregate({
        where: { donorId: id, storeId, status: "completed" },
        _avg: { amount: true },
      });

      const recencyScore = Math.max(0, 100 - daysSinceLast / 30);
      const frequencyScore = Math.min(100, donationsPerYear * 10);
      const monetaryScore = Math.min(100, (avgDonation._avg.amount || 0) / 10);

      const compositeScore =
        Math.round(
          (recencyScore * 0.4 + frequencyScore * 0.4 + monetaryScore * 0.2) *
            100,
        ) / 100;

      let engagementTier = "Low";
      if (compositeScore >= 80) engagementTier = "High";
      else if (compositeScore >= 50) engagementTier = "Medium";

      const emailOpenRate =
        communicationStats.emailsSent > 0
          ? Math.round(
              (communicationStats.emailsOpened / communicationStats.emailsSent) *
                10000,
            ) / 100
          : 0;

      const emailClickRate =
        communicationStats.emailsOpened > 0
          ? Math.round(
              (communicationStats.emailsClicked /
                communicationStats.emailsOpened) *
                10000,
            ) / 100
          : 0;

      return NextResponse.json(
        {
          data: {
            donorId: id,
            donorName:
              `${donor.firstName} ${donor.lastName}`.trim() || donor.organization,
            rfScores: {
              recency: Math.round(recencyScore * 100) / 100,
              frequency: Math.round(frequencyScore * 100) / 100,
              monetary: Math.round(monetaryScore * 100) / 100,
              composite: compositeScore,
            },
            engagement: {
              tier: engagementTier,
              totalDonations,
              donationFrequency: `${donationFrequency} days`,
              daysSinceLast,
              donationsPerYear,
              averageDonation:
                Math.round((avgDonation._avg.amount || 0) * 100) / 100,
              campaignsParticipated: campaignParticipation.length,
            },
            communication: {
              emailsSent: communicationStats.emailsSent,
              emailsOpened: communicationStats.emailsOpened,
              emailsClicked: communicationStats.emailsClicked,
              openRate: emailOpenRate,
              clickRate: emailClickRate,
            },
            recommendations: generateRecommendations(
              compositeScore,
              daysSinceLast,
              donationFrequency,
            ),
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_DONOR_ENGAGEMENT_GET]", {
        error,
        donorId: donorIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch donor engagement" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

function generateRecommendations(
  compositeScore: number,
  daysSinceLast: number,
  donationFrequency: number,
): string[] {
  const recommendations: string[] = [];

  if (compositeScore < 30) {
    recommendations.push("Consider re-engagement campaign with special appeal");
    recommendations.push("Send personalized outreach email");
  }

  if (daysSinceLast > 180) {
    recommendations.push(
      "Donor hasn't contributed in 6+ months - prioritize reactivation",
    );
    recommendations.push("Offer exclusive update on impact of previous donations");
  }

  if (donationFrequency > 90) {
    recommendations.push("Infrequent donor - consider quarterly check-ins");
  }

  if (compositeScore > 70) {
    recommendations.push(
      "High-value donor - consider major gifts officer assignment",
    );
    recommendations.push("Invite to exclusive donor appreciation events");
  }

  return recommendations.length > 0
    ? recommendations
    : [
        "Donor is actively engaged - maintain current communication schedule",
      ];
}
