import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.CREATIVE_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let clientIdForLog = "";
    try {
      const { id } = await params;
      clientIdForLog = id;

      const client = await prisma.creativeClient.findFirst({
        where: { id, storeId },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const projects = await prisma.creativeProject.findMany({
        where: {
          clientId: id,
          storeId,
          status: { not: "cancelled" },
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        { data: projects },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_CLIENT_PROJECTS_GET]", {
        error,
        clientId: clientIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch client projects" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
