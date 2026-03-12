import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const TrustTransactionSchema = z.object({
  clientId: z.string(),
  accountId: z.string(),
  type: z.enum(["receipt", "disbursement", "transfer_to_operating", "refund"]),
  amount: z.number().positive(),
  description: z.string().min(1),
  referenceNumber: z.string().optional(),
});

const ReconciliationSchema = z.object({
  accountId: z.string(),
  endDate: z.string().datetime(),
  adjustments: z.array(z.object({
    description: z.string(),
    amount: z.number(),
    type: z.enum(["add", "subtract"]),
  })).default([]),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const action = searchParams.get("action") || "accounts";
      
      if (action === "accounts") {
        const accounts = await prisma.professionalTrustAccount.findMany({
          where: { storeId },
          include: {
            _count: {
              select: {
                transactions: true,
              },
            },
          },
          orderBy: { name: "asc" },
        });

        // Calculate current balances
        const accountsWithBalances = await Promise.all(
          accounts.map(async (account) => {
            const balance = await calculateAccountBalance(account.id);
            return {
              ...account,
              currentBalance: balance,
            };
          })
        );

        return NextResponse.json(
          { data: accountsWithBalances },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "balance") {
        const accountId = searchParams.get("accountId");
        if (!accountId) {
          return NextResponse.json(
            { error: "Account ID required" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        const balance = await calculateAccountBalance(accountId);
        return NextResponse.json(
          { data: { balance } },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "ledger") {
        const clientId = searchParams.get("clientId");
        if (!clientId) {
          return NextResponse.json(
            { error: "Client ID required" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        const ledgerEntries = await prisma.professionalTrustTransaction.findMany({
          where: {
            storeId,
            clientId,
          },
          orderBy: { createdAt: "asc" },
        });

        // Calculate running balance
        let runningBalance = 0;
        const ledgerWithBalance = ledgerEntries.map(entry => {
          if (entry.type === "receipt") {
            runningBalance += entry.amount;
          } else {
            runningBalance -= entry.amount;
          }
          
          return {
            ...entry,
            balance: runningBalance,
          };
        });

        return NextResponse.json(
          { data: ledgerWithBalance },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "negative_balances") {
        const negativeBalances = await getNegativeBalanceAlerts(storeId);
        return NextResponse.json(
          { data: negativeBalances },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "summary") {
        const summary = await getTrustAccountSummary(storeId);
        return NextResponse.json(
          { data: summary },
          { headers: standardHeaders(requestId) }
        );
      }
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_TRUST_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch trust accounting data" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const action = json.action || "transaction";
      
      if (action === "transaction") {
        const parseResult = TrustTransactionSchema.parse(json);
        
        // Verify client exists
        const client = await prisma.professionalClient.findFirst({
          where: { id: parseResult.clientId, storeId },
        });

        if (!client) {
          return NextResponse.json(
            { error: "Client not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        // Verify account exists
        const account = await prisma.professionalTrustAccount.findFirst({
          where: { id: parseResult.accountId, storeId },
        });

        if (!account) {
          return NextResponse.json(
            { error: "Trust account not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        // Check for negative balance if this is a disbursement
        if (parseResult.type !== "receipt") {
          const currentBalance = await calculateAccountBalance(parseResult.accountId);
          if (currentBalance < parseResult.amount) {
            return NextResponse.json(
              { error: "Insufficient funds in trust account" },
              { status: 400, headers: standardHeaders(requestId) }
            );
          }
        }

        const createdTransaction = await prisma.professionalTrustTransaction.create({
          data: {
            ...parseResult,
            storeId,
            createdBy: user.id,
          },
          include: {
            client: {
              select: {
                companyName: true,
              },
            },
            account: {
              select: {
                name: true,
              },
            },
          },
        });

        logger.info("[PROFESSIONAL_TRUST_TRANSACTION_CREATE]", {
          transactionId: createdTransaction.id,
          clientId: parseResult.clientId,
          accountId: parseResult.accountId,
          type: parseResult.type,
          amount: parseResult.amount,
        });

        return NextResponse.json(
          { data: createdTransaction },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "reconcile") {
        const parseResult = ReconciliationSchema.parse(json);
        
        const reconciliation = await generateThreeWayReconciliation(
          storeId,
          parseResult.accountId,
          new Date(parseResult.endDate),
          parseResult.adjustments
        );

        return NextResponse.json(
          { data: reconciliation },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "refund") {
        const { clientId, accountId, amount, description, recipient, method } = json;
        
        // Validate inputs
        if (!clientId || !accountId || !amount || !recipient || !method) {
          return NextResponse.json(
            { error: "Missing required fields for refund" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        // Process refund transaction
        const refundTransaction = await prisma.professionalTrustTransaction.create({
          data: {
            storeId,
            clientId,
            accountId,
            type: "refund",
            amount,
            description: `${description || "Client refund"} - ${recipient} (${method})`,
            createdBy: user.id,
          },
        });

        logger.info("[PROFESSIONAL_TRUST_REFUND]", {
          transactionId: refundTransaction.id,
          clientId,
          amount,
          recipient,
          method,
        });

        return NextResponse.json(
          { data: refundTransaction },
          { headers: standardHeaders(requestId) }
        );
      }
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_TRUST_ACTION]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to process trust accounting action" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Analytics endpoint for trust accounting metrics
export async function GET_TRUST_ANALYTICS(req: NextRequest, { storeId, correlationId }: APIContext) {
  const requestId = correlationId;
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalReceipts, totalDisbursements, accountCount, clientCount] = await Promise.all([
      prisma.professionalTrustTransaction.aggregate({
        where: {
          storeId,
          type: "receipt",
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      prisma.professionalTrustTransaction.aggregate({
        where: {
          storeId,
          type: { in: ["disbursement", "transfer_to_operating", "refund"] },
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      prisma.professionalTrustAccount.count({ where: { storeId } }),
      prisma.professionalTrustTransaction.groupBy({
        by: ['clientId'],
        where: { storeId },
      }).then(groups => groups.length),
    ]);

    const analytics = {
      totalReceipts: totalReceipts._sum.amount || 0,
      totalDisbursements: totalDisbursements._sum.amount || 0,
      netActivity: (totalReceipts._sum.amount || 0) - (totalDisbursements._sum.amount || 0),
      accountCount,
      clientCount,
      accountsNeedingReconciliation: await getAccountsNeedingReconciliation(storeId),
    };

    return NextResponse.json(
      { data: analytics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_TRUST_ANALYTICS]", { error, storeId });
    return NextResponse.json(
      { error: "Failed to fetch trust accounting analytics" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

async function calculateAccountBalance(accountId: string): Promise<number> {
  const [receipts, disbursements] = await Promise.all([
    prisma.professionalTrustTransaction.aggregate({
      where: { accountId, type: "receipt" },
      _sum: { amount: true },
    }),
    prisma.professionalTrustTransaction.aggregate({
      where: { accountId, type: { in: ["disbursement", "transfer_to_operating", "refund"] } },
      _sum: { amount: true },
    }),
  ]);

  return (receipts._sum.amount || 0) - (disbursements._sum.amount || 0);
}

async function getNegativeBalanceAlerts(storeId: string) {
  const accounts = await prisma.professionalTrustAccount.findMany({
    where: { storeId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const alerts = [];
  
  for (const account of accounts) {
    const balance = await calculateAccountBalance(account.id);
    if (balance < 0 && account.transactions.length > 0) {
      const lastTransaction = account.transactions[0];
      
      alerts.push({
        accountId: account.id,
        accountName: account.name,
        negativeAmount: Math.abs(balance),
        lastTransactionDate: lastTransaction.createdAt,
        clientId: lastTransaction.clientId,
      });
    }
  }

  return alerts;
}

async function generateThreeWayReconciliation(
  storeId: string,
  accountId: string,
  endDate: Date,
  adjustments: Array<{ description: string; amount: number; type: "add" | "subtract" }>
) {
  // This is a simplified reconciliation - in practice this would be much more complex
  // involving bank statements, general ledger, and trust ledger matching
  
  const account = await prisma.professionalTrustAccount.findFirst({
    where: { id: accountId, storeId },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  // Get trust ledger balance
  const trustLedgerBalance = await calculateAccountBalance(accountId);
  
  // In a real implementation, these would come from actual bank statements and GL
  const bankStatementBalance = trustLedgerBalance + 100; // Simulated discrepancy
  const generalLedgerBalance = trustLedgerBalance - 50;  // Simulated discrepancy

  // Apply adjustments
  let reconciledBalance = trustLedgerBalance;
  for (const adj of adjustments) {
    reconciledBalance += (adj.type === "add" ? adj.amount : -adj.amount);
  }

  // Identify discrepancies
  const discrepancies = [
    {
      description: "Bank statement vs Trust ledger",
      difference: bankStatementBalance - trustLedgerBalance,
    },
    {
      description: "General ledger vs Trust ledger", 
      difference: generalLedgerBalance - trustLedgerBalance,
    }
  ].filter(d => Math.abs(d.difference) > 0.01); // Filter out negligible differences

  return {
    bankStatementBalance,
    trustLedgerBalance,
    generalLedgerBalance,
    adjustments,
    reconciledBalance,
    discrepancies,
    reconciliationDate: new Date().toISOString(),
    periodEnd: endDate.toISOString(),
  };
}

async function getTrustAccountSummary(storeId: string) {
  const accounts = await prisma.professionalTrustAccount.findMany({
    where: { storeId },
  });

  return Promise.all(
    accounts.map(async (account) => {
      const [receipts, disbursements, clientCount] = await Promise.all([
        prisma.professionalTrustTransaction.aggregate({
          where: { accountId: account.id, type: "receipt" },
          _sum: { amount: true },
        }),
        prisma.professionalTrustTransaction.aggregate({
          where: { accountId: account.id, type: { in: ["disbursement", "transfer_to_operating", "refund"] } },
          _sum: { amount: true },
        }),
        prisma.professionalTrustTransaction.groupBy({
          by: ['clientId'],
          where: { accountId: account.id },
        }).then(groups => groups.length),
      ]);

      const currentBalance = (receipts._sum.amount || 0) - (disbursements._sum.amount || 0);

      return {
        accountId: account.id,
        accountName: account.name,
        currentBalance,
        totalReceipts: receipts._sum.amount || 0,
        totalDisbursements: disbursements._sum.amount || 0,
        netActivity: currentBalance,
        clientCount,
      };
    })
  );
}

async function getAccountsNeedingReconciliation(storeId: string) {
  // In a real implementation, this would check last reconciliation dates
  // For now, return all accounts as needing reconciliation monthly
  const accounts = await prisma.professionalTrustAccount.findMany({
    where: { storeId },
  });

  return accounts.length;
}