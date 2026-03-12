import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const donor = await prisma.nonprofitDonor.findFirst({
      where: { id, storeId },
      include: {
        donations: {
          where: { status: "completed" },
          select: {
            id: true,
            amount: true,
            currency: true,
            createdAt: true,
            campaign: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        recurringDonations: {
          where: { status: "active" },
          select: {
            id: true,
            amount: true,
            frequency: true,
            nextPaymentDate: true,
          },
        },
        volunteerHours: {
          select: {
            id: true,
            hours: true,
            activity: true,
            date: true,
          },
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!donor) {
      return NextResponse.json(
        { error: "Donor not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate donor metrics
    const totalDonated = donor.donations.reduce((sum, d) => sum + d.amount, 0);
    const donationCount = donor.donations.length;
    const averageDonation = donationCount > 0 ? totalDonated / donationCount : 0;
    
    // Calculate recency, frequency, monetary value (RFM)
    const lastDonation = donor.donations[0];
    const daysSinceLastDonation = lastDonation 
      ? Math.floor((Date.now() - lastDonation.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Parse communication preferences
    const donorWithMetrics = {
      ...donor,
      communicationPreferences: JSON.parse(donor.communicationPreferences || "{}"),
      metrics: {
        totalDonated,
        donationCount,
        averageDonation: Math.round(averageDonation * 100) / 100,
        daysSinceLastDonation,
        recurringDonationCount: donor.recurringDonations.length,
        totalVolunteerHours: donor.volunteerHours.reduce((sum, v) => sum + v.hours, 0),
      },
    };

    return NextResponse.json(
      { data: donorWithMetrics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[NONPROFIT_DONOR_GET]", { error, donorId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch donor" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}