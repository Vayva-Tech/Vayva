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

    const client = await prisma.creativeClient.findFirst({
      where: { id, storeId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get client's projects
    const projects = await prisma.creativeProject.findMany({
      where: { 
        clientId: id,
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
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[CREATIVE_CLIENT_PROJECTS_GET]", { error, clientId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch client projects" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}