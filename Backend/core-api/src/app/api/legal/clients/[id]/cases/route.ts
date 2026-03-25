import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.LEGAL_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let clientIdForLog = "";
    try {
      const { id } = await params;
      clientIdForLog = id;

      const client = await prisma.legalClient.findFirst({
        where: { id, storeId },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const cases = await prisma.legalCase.findMany({
        where: {
          clientId: id,
          storeId,
          status: { not: "dismissed" },
        },
        include: {
          practiceArea: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              matters: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        { data: cases },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[LEGAL_CLIENT_CASES_GET]", {
        error,
        clientId: clientIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch client cases" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
