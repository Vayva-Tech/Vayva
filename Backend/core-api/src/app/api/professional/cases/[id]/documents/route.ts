import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let caseIdForLog = "";
    try {
      const { id } = await params;
      caseIdForLog = id;

      const caseItem = await prisma.professionalCase.findFirst({
        where: { id, storeId },
      });

      if (!caseItem) {
        return NextResponse.json(
          { error: "Case not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const documents = await prisma.professionalDocument.findMany({
        where: { caseId: id, storeId },
        select: {
          id: true,
          name: true,
          fileType: true,
          fileSize: true,
          createdAt: true,
          uploadedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        { data: documents },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_CASE_DOCUMENTS_GET]", {
        error,
        caseId: caseIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch case documents" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
