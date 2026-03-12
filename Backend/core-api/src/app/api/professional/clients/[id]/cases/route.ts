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

    const client = await prisma.professionalClient.findFirst({
      where: { id, storeId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get client's cases
    const cases = await prisma.professionalCase.findMany({
      where: { 
        clientId: id,
        status: { not: "archived" },
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
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_CLIENT_CASES_GET]", { error, clientId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch client cases" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}