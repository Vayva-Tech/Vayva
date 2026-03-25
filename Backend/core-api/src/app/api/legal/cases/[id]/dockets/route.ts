import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.LEGAL_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let caseIdForLog = "";
    try {
      const { id } = await params;
      caseIdForLog = id;

      const caseItem = await prisma.legalCase.findFirst({
        where: { id, storeId },
      });

      if (!caseItem) {
        return NextResponse.json(
          { error: "Case not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const dockets = await prisma.legalDocket.findMany({
        where: { caseId: id, storeId },
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
      logger.error("[LEGAL_CASE_DOCKETS_GET]", {
        error,
        caseId: caseIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch case dockets" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
