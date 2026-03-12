import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const inviteId = getString(body.inviteId);

      if (!inviteId) {
        return NextResponse.json(
          { error: "Invite ID is required" },
          { status: 400 },
        );
      }

      const deleted = await prisma.staffInvite.deleteMany({
        where: {
          id: inviteId,
          storeId,
          acceptedAt: null,
        },
      });

      if (deleted.count === 0) {
        return NextResponse.json(
          { error: "Invite not found or already accepted" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Invite revoked successfully",
      });
    } catch (error: unknown) {
      logger.error("[MERCHANT_TEAM_INVITE_REVOKE_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to revoke invite" },
        { status: 500 },
      );
    }
  },
);
