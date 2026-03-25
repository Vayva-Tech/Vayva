import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.MEMBERSHIPS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let membershipIdForLog = "";
    try {
      const { id } = await params;
      membershipIdForLog = id;

      const membership = await prisma.wellnessMembership.findFirst({
        where: { id, storeId },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Membership not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const daysRemaining = membership.endDate
        ? Math.ceil(
            (membership.endDate.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          )
        : null;

      const sessionsRemaining = membership.sessionsIncluded
        ? membership.sessionsIncluded - membership.sessionsUsed
        : null;

      const utilizationRate = membership.sessionsIncluded
        ? Math.round(
            (membership.sessionsUsed / membership.sessionsIncluded) * 10000,
          ) / 100
        : 0;

      const membershipWithDetails = {
        ...membership,
        paymentMethod: membership.paymentMethod as string,
        benefits: JSON.parse(membership.benefits || "[]"),
        restrictions: JSON.parse(membership.restrictions || "[]"),
        clientName: `${membership.client.firstName} ${membership.client.lastName}`,
        instructorName: membership.instructor
          ? `${membership.instructor.firstName} ${membership.instructor.lastName}`
          : null,
        metrics: {
          daysRemaining,
          sessionsRemaining,
          utilizationRate,
          isActive: membership.status === "active",
          isRenewalDue: daysRemaining !== null && daysRemaining <= 7,
        },
      };

      return NextResponse.json(
        { data: membershipWithDetails },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_MEMBERSHIP_GET]", {
        error,
        membershipId: membershipIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch membership" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
