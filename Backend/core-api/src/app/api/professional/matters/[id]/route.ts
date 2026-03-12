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

    const matter = await prisma.professionalMatter.findFirst({
      where: { id, storeId },
      include: {
        case: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            fileType: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        timesheets: {
          select: {
            id: true,
            hours: true,
            date: true,
            description: true,
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!matter) {
      return NextResponse.json(
        { error: "Matter not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate matter metrics
    const totalTimeLogged = matter.timesheets.reduce((sum, ts) => sum + ts.hours, 0);
    const progress = matter.estimatedHours && matter.estimatedHours > 0 
      ? Math.min((totalTimeLogged / matter.estimatedHours) * 100, 100)
      : 0;

    const matterWithDetails = {
      ...matter,
      metrics: {
        timeLogged: totalTimeLogged,
        estimatedHours: matter.estimatedHours || 0,
        progress: Math.round(progress),
        documentCount: matter.documents.length,
        timesheetCount: matter.timesheets.length,
        remainingHours: matter.estimatedHours ? Math.max(0, matter.estimatedHours - totalTimeLogged) : 0,
      },
    };

    return NextResponse.json(
      { data: matterWithDetails },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_MATTER_GET]", { error, matterId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch matter" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}