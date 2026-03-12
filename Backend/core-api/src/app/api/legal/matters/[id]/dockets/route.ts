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

    const matter = await prisma.legalMatter.findFirst({
      where: { id, storeId },
    });

    if (!matter) {
      return NextResponse.json(
        { error: "Matter not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get matter's dockets
    const dockets = await prisma.legalDocket.findMany({
      where: { matterId: id },
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
    logger.error("[LEGAL_MATTER_DOCKETS_GET]", { error, matterId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch matter dockets" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}