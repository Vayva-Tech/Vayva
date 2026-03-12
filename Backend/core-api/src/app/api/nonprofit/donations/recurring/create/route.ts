import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const POST = withVayvaAPI(
  PERMISSIONS.DONATIONS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      
      // Schema for creating recurring donations
      const { donorId, amount, currency = "USD", frequency, paymentMethod, startDate, endDate, notes } = json;

      // Validate required fields
      if (!donorId || !amount || !frequency || !paymentMethod) {
        return NextResponse.json(
          { error: "Missing required fields: donorId, amount, frequency, paymentMethod" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify donor exists
      const donor = await prisma.nonprofitDonor.findFirst({
        where: { id: donorId, storeId },
      });

      if (!donor) {
        return NextResponse.json(
          { error: "Donor not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Validate frequency
      const validFrequencies = ["weekly", "monthly", "quarterly", "annually"];
      if (!validFrequencies.includes(frequency)) {
        return NextResponse.json(
          { error: "Invalid frequency. Must be: weekly, monthly, quarterly, annually" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Calculate next payment date
      const now = new Date();
      const nextPaymentDate = new Date(now.getTime() + this.getFrequencyMilliseconds(frequency));

      const recurringDonation = await prisma.nonprofitRecurringDonation.create({
        data: {
          storeId,
          donorId,
          amount: parseFloat(amount),
          currency,
          frequency,
          paymentMethod,
          startDate: startDate ? new Date(startDate) : now,
          endDate: endDate ? new Date(endDate) : null,
          nextPaymentDate,
          notes,
          status: "active",
        },
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              organization: true,
            },
          },
        },
      });

      return NextResponse.json(recurringDonation, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_DONATIONS_RECURRING_CREATE]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create recurring donation" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Helper method to calculate frequency in milliseconds
function getFrequencyMilliseconds(frequency: string): number {
  const msInDay = 24 * 60 * 60 * 1000;
  switch (frequency) {
    case "weekly": return 7 * msInDay;
    case "monthly": return 30 * msInDay;
    case "quarterly": return 90 * msInDay;
    case "annually": return 365 * msInDay;
    default: return 30 * msInDay;
  }
}