import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const caseItem = await prisma.legalCase.findFirst({
      where: { id, storeId },
    });

    if (!caseItem) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get case's dockets
    const dockets = await prisma.legalDocket.findMany({
      where: { caseId: id },
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
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[LEGAL_CASE_DOCKETS_GET]", { error, caseId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch case dockets" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}