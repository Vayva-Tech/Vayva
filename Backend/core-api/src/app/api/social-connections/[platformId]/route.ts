import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

/** DELETE /api/social-connections/[platformId] — disconnect a social platform */
export const DELETE = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (_req: NextRequest, { storeId, user, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    const { platformId } = await params;

    try {
      const connection = await prisma.socialConnection.findUnique({
        where: {
          storeId_platform: {
            storeId,
            platform: platformId,
          },
        },
      });

      if (!connection) {
        return NextResponse.json(
          { error: "Connection not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      await prisma.socialConnection.delete({
        where: { id: connection.id },
      });

      logger.info("[SOCIAL_CONNECTION_DELETED]", {
        storeId,
        platform: platformId,
        userId: user.id,
        accountName: connection.accountName,
      });

      return NextResponse.json(
        { success: true, message: `${platformId} disconnected successfully` },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[SOCIAL_CONNECTIONS_DELETE]", error, { storeId, platformId });
      return NextResponse.json(
        { error: "Failed to disconnect social platform" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
