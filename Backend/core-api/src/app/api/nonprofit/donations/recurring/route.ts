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
      const recurringDonations = await prisma.nonprofitRecurringDonation.findMany({
        where: {
          storeId,
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
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      // Calculate recurring revenue
      const monthlyRecurringRevenue = recurringDonations
        .filter(rd => rd.frequency === "monthly")
        .reduce((sum, rd) => sum + rd.amount, 0);
      
      const annualRecurringRevenue = recurringDonations
        .filter(rd => rd.frequency === "annually")
        .reduce((sum, rd) => sum + rd.amount, 0);

      return NextResponse.json(
        {
          data: recurringDonations,
          summary: {
            totalCount: recurringDonations.length,
            monthlyRecurringRevenue,
            annualRecurringRevenue,
            currency: recurringDonations[0]?.currency || "USD",
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_DONATIONS_RECURRING_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch recurring donations" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.DONATIONS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      
      // This would handle creating new recurring donation schedules
      // Implementation would be similar to the recurring logic in donations/route.ts
      
      return NextResponse.json(
        { message: "Recurring donation endpoint placeholder" },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_DONATIONS_RECURRING_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create recurring donation" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);