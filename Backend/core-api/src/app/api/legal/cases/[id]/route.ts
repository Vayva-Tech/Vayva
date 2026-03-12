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
        court: {
          select: {
            id: true,
            name: true,
          },
        },
        judge: {
          select: {
            id: true,
            name: true,
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
        dockets: {
          select: {
            id: true,
            filingDate: true,
            nextHearing: true,
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
    const totalTimeLogged = await prisma.legalTimesheet.aggregate({
      where: { caseId: id },
      _sum: { hours: true },
    });

    const totalBillableValue = await prisma.legalTimesheet.aggregate({
      where: { caseId: id, billable: true },
      _sum: { hours: true },
    });

    const caseWithDetails = {
      ...caseItem,
      metrics: {
        totalTimeLogged: totalTimeLogged._sum.hours || 0,
        totalBillableHours: totalBillableValue._sum.hours || 0,
        totalMatters: caseItem.matters.length,
        totalDockets: caseItem.dockets.length,
        completedMatters: caseItem.matters.filter(m => m.status === "completed").length,
        matterCompletionRate: caseItem.matters.length > 0 
          ? (caseItem.matters.filter(m => m.status === "completed").length / caseItem.matters.length) * 100
          : 0,
        daysOpen: caseItem.filingDate 
          ? Math.floor((Date.now() - new Date(caseItem.filingDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        progress: caseItem.status === "closed" || caseItem.status === "settled" || caseItem.status === "dismissed" 
          ? 100 : 
          caseItem.status === "in_progress" ? 75 :
          caseItem.status === "open" ? 25 : 0,
      },
    };

    return NextResponse.json(
      { data: caseWithDetails },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[LEGAL_CASE_GET]", { error, caseId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch case" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}