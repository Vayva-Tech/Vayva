/**
 * Real Estate Transactions API Routes
 * POST /api/realestate/transactions - Create transaction
 * GET /api/realestate/transactions - List transactions
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// POST Create Transaction
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const {
        propertyId,
        type,
        side,
        buyerName,
        buyerEmail,
        buyerPhone,
        sellerName,
        sellerEmail,
        sellerPhone,
        contractPrice,
        earnestMoney,
        closingDate,
        notes,
      } = body;

      if (!propertyId || !buyerName || !sellerName || !contractPrice || !closingDate) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Generate transaction number
      const transactionNumber = `TXN-${Date.now()}`;

      // Create transaction
      const transaction = await prisma.realEstateTransaction.create({
        data: {
          merchantId: storeId,
          agentId: user.id,
          transactionNumber,
          type: type || "purchase",
          side: side || "dual",
          status: "draft",
          propertyId,
          buyerName,
          buyerEmail,
          buyerPhone,
          sellerName,
          sellerEmail,
          sellerPhone,
          contractPrice,
          earnestMoney: earnestMoney || 0,
          closingDate: new Date(closingDate),
          notes,
        },
      });

      // Create default milestones
      const milestoneTemplates = [
        { name: "Contract Signed", category: "contract", dueDays: 0 },
        { name: "Earnest Money Deposit", category: "financial", dueDays: 3 },
        { name: "Inspection Period", category: "inspection", dueDays: 10 },
        { name: "Financing Contingency", category: "financial", dueDays: 21 },
        { name: "Appraisal", category: "appraisal", dueDays: 21 },
        { name: "Title Search", category: "title", dueDays: 15 },
        { name: "Final Walkthrough", category: "closing", dueDays: 30 },
        { name: "Closing Day", category: "closing", dueDays: 30 },
      ];

      for (const template of milestoneTemplates) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + template.dueDays);

        await prisma.transactionMilestone.create({
          data: {
            transactionId: transaction.id,
            name: template.name,
            category: template.category,
            status: template.dueDays === 0 ? "in_progress" : "pending",
            dueDate,
            dependencies: [],
            documents: [],
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: transaction,
      });
    } catch (error: unknown) {
      logger.error("[TRANSACTION_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// GET List Transactions
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");

      const transactions = await prisma.realEstateTransaction.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
        },
        include: {
          property: true,
          milestones: true,
          riskFlags: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.realEstateTransaction.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        data: transactions,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[TRANSACTION_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);
