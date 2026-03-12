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

    const caseItem = await prisma.professionalCase.findFirst({
      where: { id, storeId },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          },
        },
        practiceArea: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        matters: {
          select: {
            id: true,
            name: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
      },
    });

    if (!caseItem) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate case metrics
    const totalTimeLogged = await prisma.professionalTimesheet.aggregate({
      where: { caseId: id },
      _sum: { hours: true },
    });

    const totalBillableValue = await prisma.professionalTimesheet.aggregate({
      where: { caseId: id, billable: true },
      _sum: { hours: true },
    });

    const caseWithDetails = {
      ...caseItem,
      metrics: {
        totalTimeLogged: totalTimeLogged._sum.hours || 0,
        totalBillableHours: totalBillableValue._sum.hours || 0,
        totalMatters: caseItem.matters.length,
        completedMatters: caseItem.matters.filter(m => m.status === "closed").length,
        matterCompletionRate: caseItem.matters.length > 0 
          ? (caseItem.matters.filter(m => m.status === "closed").length / caseItem.matters.length) * 100
          : 0,
        progress: caseItem.status === "closed" ? 100 : 
                 caseItem.status === "in_progress" ? 75 :
                 caseItem.status === "open" ? 25 : 0,
      },
    };

    return NextResponse.json(
      { data: caseWithDetails },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_CASE_GET]", { error, caseId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch case" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}