import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * POST /api/legal/trust/receipts
 * Record trust receipt (deposit)
 */
export const POST = withVayvaAPI(
  PERMISSIONS.TRUST_MANAGE,
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        accountId,
        clientId,
        caseId,
        amount,
        description,
        checkNumber,
        referenceNumber,
      } = body;

      const user = request.headers.get("x-user-id") || 'system';

      const account = await prisma.trustAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return NextResponse.json(
          { success: false, error: 'Trust account not found' },
          { status: 404 }
        );
      }

      // Create transaction
      const transaction = await prisma.trustTransaction.create({
        data: {
          accountId,
          clientId,
          caseId,
          type: 'deposit',
          amount,
          balance: account.currentBalance + amount,
          description,
          checkNumber,
          referenceNumber,
          processedBy: user,
          status: 'completed',
          transactionDate: new Date(),
        },
      });

      // Update account balance
      await prisma.trustAccount.update({
        where: { id: accountId },
        data: { currentBalance: transaction.balance },
      });

      // Update/create client ledger
      const ledger = await prisma.clientLedger.upsert({
        where: {
          accountId_clientId: {
            accountId,
            clientId,
          },
        },
        update: {
          balance: { increment: amount },
          totalDeposits: { increment: amount },
          lastActivity: new Date(),
        },
        create: {
          accountId,
          clientId,
          caseId,
          caseNumber: '',
          clientName: '',
          balance: amount,
          totalDeposits: amount,
          totalDisbursements: 0,
          totalTransfers: 0,
          lastActivity: new Date(),
        },
      });

      return NextResponse.json({ success: true, data: { transaction, ledger } });
    } catch (error) {
      logger.error('[LEGAL_TRUST_RECEIPT_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to record trust receipt' },
        { status: 500 }
      );
    }
  }
);
