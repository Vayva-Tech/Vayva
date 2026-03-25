import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let matterIdForLog = "";
    try {
      const { id } = await params;
      matterIdForLog = id;

      const matter = await prisma.professionalMatter.findFirst({
        where: { id, storeId },
      });

      if (!matter) {
        return NextResponse.json(
          { error: "Matter not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const documents = await prisma.professionalDocument.findMany({
        where: { matterId: id, storeId },
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
      logger.error("[PROFESSIONAL_MATTER_DOCUMENTS_GET]", {
        error,
        matterId: matterIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch matter documents" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
