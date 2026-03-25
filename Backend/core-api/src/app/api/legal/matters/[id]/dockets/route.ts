import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.LEGAL_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let matterIdForLog = "";
    try {
      const { id } = await params;
      matterIdForLog = id;

      const matter = await prisma.legalMatter.findFirst({
        where: { id, storeId },
      });

      if (!matter) {
        return NextResponse.json(
          { error: "Matter not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const dockets = await prisma.legalDocket.findMany({
        where: { matterId: id, storeId },
        select: {
          id: true,
          filingDate: true,
          nextHearing: true,
          description: true,
          status: true,
          createdAt: true,
        },
        orderBy: { filingDate: "desc" },
      });

      return NextResponse.json(
        { data: dockets },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[LEGAL_MATTER_DOCKETS_GET]", {
        error,
        matterId: matterIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch matter dockets" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
