/**
 * Transaction Detail API Routes
 * GET /api/realestate/transactions/[id] - Get transaction details
 * PATCH /api/realestate/transactions/[id] - Update transaction
 * DELETE /api/realestate/transactions/[id] - Delete transaction
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Transaction Details
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id } = params;

      const transaction = await prisma.realEstateTransaction.findFirst({
        where: {
          id,
          merchantId: storeId,
        },
        include: {
          property: true,
          milestones: {
            orderBy: { dueDate: "asc" },
          },
          riskFlags: {
            where: { resolvedAt: null },
          },
        },
      });

      if (!transaction) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: transaction,
      });
    } catch (error: unknown) {
      logger.error("[TRANSACTION_DETAIL_GET]", error, { storeId, id: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// PATCH Update Transaction
export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id } = params;
      const body = await request.json();

      const transaction = await prisma.realEstateTransaction.updateMany({
        where: {
          id,
          merchantId: storeId,
        },
        data: {
          ...body,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: transaction,
      });
    } catch (error: unknown) {
      logger.error("[TRANSACTION_PATCH]", error, { storeId, id: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// DELETE Transaction
export const DELETE = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id } = params;

      await prisma.realEstateTransaction.deleteMany({
        where: {
          id,
          merchantId: storeId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Transaction deleted",
      });
    } catch (error: unknown) {
      logger.error("[TRANSACTION_DELETE]", error, { storeId, id: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);
