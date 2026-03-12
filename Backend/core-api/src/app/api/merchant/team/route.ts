import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (req, { storeId }) => {
    try {
      const members = await prisma.membership.findMany({
        where: { storeId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      const invites = await prisma.staffInvite.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(
        {
          members: members.map((m) => ({
            id: m.id,
            userId: m.userId,
            name:
              `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim() ||
              "Unknown",
            email: m.user.email,
            role: m.role_enum,
            status: m.status,
            joinedAt: m.createdAt,
          })),
          invites: invites.map((i) => ({
            id: i.id,
            email: i.email,
            role: i.role,
            status: i.acceptedAt
              ? "accepted"
              : new Date(i.expiresAt) < new Date()
                ? "expired"
                : "pending",
            createdAt: i.createdAt,
            expiresAt: i.expiresAt,
          })),
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[MERCHANT_TEAM_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
