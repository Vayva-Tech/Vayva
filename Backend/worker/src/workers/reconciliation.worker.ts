import { Worker } from "bullmq";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import type { RedisConnection, ReconciliationJobData } from "../types";
import { LedgerCategory } from "../../../core-api/src/lib/accounting/ledger";

const QUEUE_NAME = "reconciliation";

// List of all ledger accounts to reconcile
const ACCOUNTS_TO_RECONCILE = [
  LedgerCategory.CASH,
  LedgerCategory.BANK,
  LedgerCategory.SALES_REVENUE,
  LedgerCategory.COGS_PRODUCTS,
  LedgerCategory.PAYOUT_FEES,
  LedgerCategory.PAYMENT_PROCESSING,
  LedgerCategory.VAT_PAYABLE,
  LedgerCategory.VAT_RECOVERABLE,
  LedgerCategory.WHT_PAYABLE,
  LedgerCategory.COMPANY_TAX_PAYABLE,
];

interface AccountDiscrepancy {
  account: string;
  ledgerSumKobo: bigint;
  expectedBalance: bigint;
  difference: bigint;
}

export function registerReconciliationWorker(
  connection: RedisConnection,
): void {
  new Worker<ReconciliationJobData>(
    QUEUE_NAME,
    async (job) => {
      const { storeId } = job.data;

      // Check wallet reconciliation (existing logic)
      const [wallet, walletLedgerSummary] = await Promise.all([
        prisma.wallet.findUnique({ where: { storeId } }),
        prisma.ledgerEntry.aggregate({
          where: { storeId, account: LedgerCategory.CASH },
          _sum: { amount: true },
        }),
      ]);

      if (wallet) {
        const ledgerSumKobo = BigInt(
          Math.round(Number(walletLedgerSummary._sum.amount || 0) * 100),
        );
        const difference = wallet.availableKobo - ledgerSumKobo;

        if (difference !== 0n) {
          logger.error(`[RECON] BUG: Store ${storeId} has wallet discrepancy!`, {
            storeId,
            walletBalance: wallet.availableKobo.toString(),
            ledgerSum: ledgerSumKobo.toString(),
            difference: difference.toString(),
            app: "worker",
          });

          await prisma.auditLog.create({
            data: {
              app: "ops",
              action: "FINANCIAL_DISCREPANCY_FOUND",
              targetType: "store",
              targetId: storeId,
              targetStoreId: storeId,
              severity: "HIGH",
              requestId: `recon-wallet-${storeId}-${Date.now()}`,
              metadata: {
                account: "CASH",
                walletBalance: wallet.availableKobo.toString(),
                ledgerSum: ledgerSumKobo.toString(),
                difference: difference.toString(),
              },
            },
          });
        }
      }

      // Check all ledger accounts for discrepancies
      const discrepancies: AccountDiscrepancy[] = [];

      for (const account of ACCOUNTS_TO_RECONCILE) {
        try {
          // Get sum of credits and debits separately for this account
          const [creditAgg, debitAgg] = await Promise.all([
            prisma.ledgerEntry.aggregate({
              where: { storeId, account, direction: "credit" },
              _sum: { amount: true },
            }),
            prisma.ledgerEntry.aggregate({
              where: { storeId, account, direction: "debit" },
              _sum: { amount: true },
            }),
          ]);

          const credits = Number(creditAgg._sum.amount || 0);
          const debits = Number(debitAgg._sum.amount || 0);
          const netBalance = credits - debits;

          // For revenue/expense accounts, check if debits exceed credits abnormally
          // For asset accounts, check if debits match expected balance
          const accountType = getAccountType(account);
          
          if (accountType === "revenue" && debits > credits * 0.1) {
            // More than 10% debits on revenue is suspicious
            const ledgerSumKobo = BigInt(Math.round(netBalance * 100));
            discrepancies.push({
              account,
              ledgerSumKobo,
              expectedBalance: ledgerSumKobo, // Revenue should have minimal debits
              difference: BigInt(Math.round(debits * 100)),
            });
          }

          // Check for negative balances on accounts that shouldn't go negative
          if (shouldNotGoNegative(account) && netBalance < 0) {
            discrepancies.push({
              account,
              ledgerSumKobo: BigInt(Math.round(Math.abs(netBalance) * 100)),
              expectedBalance: 0n,
              difference: BigInt(Math.round(Math.abs(netBalance) * 100)),
            });
          }
        } catch (accountError) {
          logger.error(`[RECON] Error checking account ${account} for store ${storeId}`, {
            storeId,
            account,
            error: accountError instanceof Error ? accountError.message : String(accountError),
            app: "worker",
          });
        }
      }

      // Log all discrepancies found
      if (discrepancies.length > 0) {
        logger.error(`[RECON] Store ${storeId} has ${discrepancies.length} account discrepancies`, {
          storeId,
          discrepancies: discrepancies.map(d => ({
            account: d.account,
            difference: d.difference.toString(),
          })),
          app: "worker",
        });

        // Create audit logs for each discrepancy
        for (const d of discrepancies) {
          await prisma.auditLog.create({
            data: {
              app: "ops",
              action: "ACCOUNT_DISCREPANCY_FOUND",
              targetType: "store",
              targetId: storeId,
              targetStoreId: storeId,
              severity: "WARN",
              requestId: `recon-${d.account}-${storeId}-${Date.now()}`,
              metadata: {
                account: d.account,
                ledgerSum: d.ledgerSumKobo.toString(),
                expectedBalance: d.expectedBalance.toString(),
                difference: d.difference.toString(),
              },
            },
          });
        }
      }

      logger.info(`[RECON] Completed reconciliation for store ${storeId}`, {
        storeId,
        discrepanciesFound: discrepancies.length,
        app: "worker",
      });
    },
    { connection },
  );

  logger.info("Registered enhanced reconciliation worker", {
    queue: QUEUE_NAME,
    accountsChecked: ACCOUNTS_TO_RECONCILE.length,
    app: "worker",
  });
}

// Helper to determine account type
function getAccountType(account: LedgerCategory): "asset" | "liability" | "revenue" | "expense" {
  const revenueAccounts = [LedgerCategory.SALES_REVENUE, LedgerCategory.SERVICE_REVENUE];
  const expenseAccounts = [
    LedgerCategory.COGS_PRODUCTS, LedgerCategory.COGS_SHIPPING,
    LedgerCategory.RENT, LedgerCategory.SALARIES, LedgerCategory.UTILITIES,
    LedgerCategory.MARKETING, LedgerCategory.SOFTWARE, LedgerCategory.PROFESSIONAL_SERVICES,
    LedgerCategory.OFFICE_SUPPLIES, LedgerCategory.PAYOUT_FEES, LedgerCategory.PAYMENT_PROCESSING,
    LedgerCategory.SUBSCRIPTION_FEES,
  ];
  const liabilityAccounts = [
    LedgerCategory.VAT_PAYABLE, LedgerCategory.VAT_RECOVERABLE,
    LedgerCategory.WHT_PAYABLE, LedgerCategory.COMPANY_TAX_PAYABLE,
    LedgerCategory.ACCOUNTS_RECEIVABLE,
  ];

  if (revenueAccounts.includes(account)) return "revenue";
  if (expenseAccounts.includes(account)) return "expense";
  if (liabilityAccounts.includes(account)) return "liability";
  return "asset";
}

// Helper to determine if account should not go negative
function shouldNotGoNegative(account: LedgerCategory): boolean {
  // Asset accounts and tax payable accounts should not go negative
  const assetAccounts = [
    LedgerCategory.CASH, LedgerCategory.BANK, LedgerCategory.INVENTORY,
  ];
  const taxAccounts = [
    LedgerCategory.VAT_PAYABLE, LedgerCategory.WHT_PAYABLE,
    LedgerCategory.COMPANY_TAX_PAYABLE,
  ];
  
  return assetAccounts.includes(account) || taxAccounts.includes(account);
}
