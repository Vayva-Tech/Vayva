import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/legal/cases - Get all legal cases
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const clientId = searchParams.get("clientId");
      const priority = searchParams.get("priority");

      const where: Record<string, unknown> = { storeId };

      if (status) {
        where.status = status;
      }

      if (clientId) {
        where.clientId = clientId;
      }

      if (priority) {
        where.priority = priority;
      }

      const [cases, total] = await Promise.all([
        (prisma as any).legalCase.findMany({
          where,
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                documents: true,
                timeEntries: true,
                invoices: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        }),
        (prisma as any).legalCase.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: cases,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + cases.length < total,
        },
      });
    } catch (error: unknown) {
      logger.error("[LEGAL_CASES_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch cases" },
        { status: 500 }
      );
    }
  }
);

// POST /api/legal/cases - Create a new legal case
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        title,
        caseNumber,
        clientId,
        assignedToId,
        description,
        practiceArea,
        status = "open",
        priority = "medium",
        openedAt,
        expectedCloseDate,
        feeArrangement,
        budget,
        retainerAmount,
      } = body;

      if (!title || !clientId) {
        return NextResponse.json(
          { success: false, error: "Title and clientId are required" },
          { status: 400 }
        );
      }

      const legalCase = await (prisma as any).legalCase.create({
        data: {
          storeId,
          title,
          caseNumber,
          clientId,
          assignedToId,
          description,
          practiceArea: practiceArea || "general",
          status,
          priority,
          openedAt: openedAt ? new Date(openedAt) : new Date(),
          expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
          feeArrangement: feeArrangement || "hourly",
          budget,
          retainerAmount,
          createdBy: user.id,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info("[LEGAL_CASE_CREATED]", { caseId: legalCase.id, storeId });

      return NextResponse.json({
        success: true,
        data: legalCase,
      });
    } catch (error: unknown) {
      logger.error("[LEGAL_CASE_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create case" },
        { status: 500 }
      );
    }
  }
);
