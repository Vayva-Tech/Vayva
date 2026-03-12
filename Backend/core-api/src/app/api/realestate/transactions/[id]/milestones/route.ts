/**
 * Transaction Milestones API Routes
 * GET /api/realestate/transactions/[id]/milestones - List milestones
 * PATCH /api/realestate/transactions/[id]/milestones/[milestoneId] - Update milestone
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Milestones
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id } = params;

      const milestones = await prisma.transactionMilestone.findMany({
        where: {
          transactionId: id,
        },
        orderBy: { dueDate: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: milestones,
      });
    } catch (error: unknown) {
      logger.error("[MILESTONES_GET]", error, { storeId, transactionId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Milestone
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id } = params;
      const body = await request.json();
      const { name, category, dueDate, description } = body;

      // Verify transaction exists and belongs to store
      const transaction = await prisma.realEstateTransaction.findFirst({
        where: { id, merchantId: storeId },
      });

      if (!transaction) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      const milestone = await prisma.transactionMilestone.create({
        data: {
          transactionId: id,
          name,
          category: category || "general",
          status: "pending",
          dueDate: dueDate ? new Date(dueDate) : null,
          description,
          dependencies: [],
          documents: [],
        },
      });

      return NextResponse.json({
        success: true,
        data: milestone,
      });
    } catch (error: unknown) {
      logger.error("[MILESTONE_POST]", error, { storeId, transactionId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);
